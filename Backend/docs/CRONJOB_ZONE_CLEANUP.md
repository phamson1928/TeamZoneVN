# Cronjob: Tự động dọn Zone chết

> **Trạng thái**: Plan — chưa implement
> **Ưu tiên**: Medium (khi rảnh thì làm)

---

## Vấn đề

- Zone chỉ có 2 status `OPEN` / `FULL` — không có `CLOSED` hay `EXPIRED`
- Zone tồn tại vĩnh viễn trong DB, không có cơ chế tự động dọn
- User bị giới hạn **4 zone đang hoạt động** — zone chết chiếm chỗ, user không tạo được zone mới
- Owner có thể tự xóa zone bằng tay, nhưng không ai ép

## Mục tiêu

Tự động hard-delete các Zone không có người tham gia sau một thời gian, giữ DB sạch và giải phóng slot cho user.

## Quy tắc xóa

| Điều kiện | Thời gian chờ | Giải thích |
|-----------|---------------|------------|
| Zone OPEN + **0 join request** (bất kỳ status nào) | **7 ngày** | Không ai request → không ai quan tâm |
| Zone OPEN + **có PENDING nhưng 0 APPROVED** | **14 ngày** | Có người xin nhưng owner không duyệt → chết |
| Zone có **Group đang active** (`isActive: true`) | **Không đụng** | Group đang có người chat → còn sống |

## Luồng xử lý

### H-24: Gửi warning cho owner

Cronjob tìm zone sắp bị xóa trong 24h tới, gửi notification:

> "Zone 'A' sẽ bị tự động xóa vào ngày mai do không có người tham gia."

Dùng `NotificationsService.create()` — cần thêm type `ZONE_AUTO_CLOSED` vào enum `NotificationType`.

### H+0: Xóa zone

Hard-delete zone khỏi DB. Cascade (`onDelete: Cascade`) tự xóa:
- `ZoneTagRelation`
- `ZoneContactMethod`
- `ZoneJoinRequest`
- `ZoneInvite`
- `Group` + `GroupMember` + `Message`

## Những gì cần thay đổi

### 1. Prisma schema

```prisma
// Thêm vào enum NotificationType trong schema.prisma
ZONE_AUTO_CLOSED
```

Sau đó chạy `npx prisma migrate dev` để generate migration.

### 2. File mới: `src/zones/zones-cleanup.service.ts`

Pattern theo `MessagesCleanupService`:

```typescript
@Injectable()
export class ZonesCleanupService {
  private readonly logger = new Logger(ZonesCleanupService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * 3:15 AM mỗi ngày — Tìm zone sắp bị xóa, gửi notification cho owner.
   * Chỉ gửi nếu zone chưa được notify trước đó (dùng trường notifiedAt
   * hoặc đơn giản là kiểm tra notification đã tồn tại trong DB).
   */
  @Cron('15 3 * * *', { name: 'notify-stale-zones' })
  async notifyStaleZones() {
    // Tìm zone thỏa mãn: OPEN + sắp đến hạn (6 ngày / 13 ngày)
    // Gửi NotificationsService.create() cho từng owner
  }

  /**
   * 3:20 AM mỗi ngày — Hard-delete zone đã quá hạn.
   */
  @Cron('20 3 * * *', { name: 'purge-stale-zones' })
  async purgeStaleZones() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    // Condition 1: 7 ngày + 0 join request
    const zones1 = await this.prisma.zone.findMany({
      where: {
        status: 'OPEN',
        createdAt: { lt: sevenDaysAgo },
        group: null,
        joinRequests: { none: {} },
      },
      select: { id: true },
    });

    // Condition 2: 14 ngày + chỉ có PENDING, không có APPROVED
    const zones2 = await this.prisma.zone.findMany({
      where: {
        status: 'OPEN',
        createdAt: { lt: fourteenDaysAgo },
        group: null,
        joinRequests: {
          some: { status: 'PENDING' },
          none: { status: 'APPROVED' },
        },
      },
      select: { id: true },
    });

    const ids = [...zones1, ...zones2].map((z) => z.id);
    if (ids.length === 0) return;

    const result = await this.prisma.zone.deleteMany({
      where: { id: { in: ids } },
    });

    this.logger.log(`[Cleanup] Đã xóa ${result.count} zone chết.`);
  }
}
```

### 3. Sửa `src/zones/zones.module.ts`

```typescript
import { Module, forwardRef } from '@nestjs/common';
import { ZonesService } from './zones.service';
import { ZonesController } from './zones.controller';
import { ZonesCleanupService } from './zones-cleanup.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [forwardRef(() => NotificationsModule)],
  controllers: [ZonesController],
  providers: [ZonesService, ZonesCleanupService],
})
export class ZonesModule {}
```

> **Lưu ý**: `ScheduleModule.forRoot()` đã được khởi tạo trong `MessagesModule`, không cần gọi lại.

### 4. Index cho hiệu năng (optional)

Thêm composite index trong schema.prisma nếu DB có nhiều zones:

```prisma
@@index([status, createdAt])
```

(Hiện tại đã có index riêng cho `status` và `createdAt`, composite sẽ nhanh hơn cho query filter cả 2 field.)

## Danh sách file

| File | Hành động |
|------|-----------|
| `prisma/schema.prisma` | Thêm `ZONE_AUTO_CLOSED` vào enum |
| `src/zones/zones-cleanup.service.ts` | **Tạo mới** |
| `src/zones/zones.module.ts` | Sửa — thêm imports + provider |
| `src/zones/zones-cleanup.service.spec.ts` | **Tạo mới** (unit test, optional) |

## Khi nào implement

- [ ] Sau khi chạy `npx prisma migrate dev` (thêm enum)
- [ ] Test thủ công: tạo zone cũ qua Prisma Studio → gọi method cleanup → kiểm tra
- [ ] Cân nhắc thêm `"lastActivityAt"` vào Zone model sau này nếu cần logic phức tạp hơn
