import {
  AppealStatus,
  ContactMethodType,
  FriendStatus,
  GroupMemberRole,
  ModerationAction,
  NotificationType,
  Platform,
  PrismaClient,
  ReportSeverity,
  ReportStatus,
  UserRole,
  UserStatus,
  ZoneInviteStatus,
  ZoneStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'User123456';
const PRESERVED_GOOGLE_USER_ID = 'b7c957ce-ba9a-4732-a9ae-609f6f832ff1';
const now = new Date();

const at = (daysAgo: number, hour = 20, minute = 0) => {
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear`;

type DemoUser = {
  email: string;
  username: string;
  bio: string;
  playStyle: string;
  createdDaysAgo: number;
  lastActiveDaysAgo: number;
  role?: UserRole;
  status?: UserStatus;
  warnCount?: number;
  tempBannedUntil?: Date;
  contactInfo?: string;
};

type DemoZone = {
  key: string;
  owner: string;
  game: string;
  title: string;
  description: string;
  requiredPlayers: number;
  createdDaysAgo: number;
  status?: ZoneStatus;
  autoApprove?: boolean;
  tags: string[];
  contacts: Array<{ type: ContactMethodType; value: string }>;
};

async function main() {
  console.log('Starting TeamZoneVN HR demo seed...');

  const preservedUser = await prisma.user.findUnique({
    where: { id: PRESERVED_GOOGLE_USER_ID },
  });

  // Reset demo data while preserving the known Google account, when it exists.
  await prisma.message.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.zoneJoinRequest.deleteMany();
  await prisma.zoneContactMethod.deleteMany();
  await prisma.zoneTagRelation.deleteMany();
  await prisma.zoneInvite.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.quickMatchQueue.deleteMany();
  await prisma.userGameProfile.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.appeal.deleteMany();
  await prisma.moderationLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.userLike.deleteMany();
  await prisma.userBlock.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.userProfile.deleteMany({
    where: preservedUser ? { userId: { not: PRESERVED_GOOGLE_USER_ID } } : {},
  });
  await prisma.user.deleteMany({
    where: preservedUser ? { id: { not: PRESERVED_GOOGLE_USER_ID } } : {},
  });
  await prisma.game.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const users: Record<string, { id: string; username: string }> = {};

  const userData: DemoUser[] = [
    { email: 'test-demo@teamzonevn.com', username: 'TestUser_Seed', bio: 'Tài khoản demo để trải nghiệm toàn bộ luồng TeamZoneVN.', playStyle: 'Linh hoạt', createdDaysAgo: 1, lastActiveDaysAgo: 0, contactInfo: 'Discord: teamzone_demo' },
    { email: 'admin@teamzonevn.com', username: 'Admin_Master', bio: 'Quản trị viên TeamZoneVN, phụ trách chất lượng cộng đồng.', playStyle: 'Quản trị', createdDaysAgo: 28, lastActiveDaysAgo: 0, role: 'ADMIN', contactInfo: 'admin@teamzonevn.com' },
    { email: 'minh.hoang@example.com', username: 'MinhMidLane', bio: 'Main Mid, thích leo rank nghiêm túc và giao tiếp rõ ràng.', playStyle: 'Competitive', createdDaysAgo: 26, lastActiveDaysAgo: 0, contactInfo: 'Discord: minhmid' },
    { email: 'linh.nguyen@example.com', username: 'LinhGenshin', bio: 'Thích khám phá Teyvat, farm boss và giúp người chơi mới.', playStyle: 'Casual', createdDaysAgo: 24, lastActiveDaysAgo: 0, contactInfo: 'UID: 812345678' },
    { email: 'tuan.tran@example.com', username: 'TuanFpsGod', bio: 'FPS player, ưu tiên teamwork và call ngắn gọn.', playStyle: 'Competitive', createdDaysAgo: 22, lastActiveDaysAgo: 1, warnCount: 1, contactInfo: 'Discord: tuanfps' },
    { email: 'huong.le@example.com', username: 'HuongSupport', bio: 'Main support, vui vẻ và luôn sẵn sàng kết nối đồng đội.', playStyle: 'Supportive', createdDaysAgo: 20, lastActiveDaysAgo: 0, contactInfo: 'Discord: huongsp' },
    { email: 'khang.do@example.com', username: 'KhangJungle', bio: 'Jungle main, chơi tối các ngày trong tuần.', playStyle: 'Competitive', createdDaysAgo: 18, lastActiveDaysAgo: 2, contactInfo: 'Discord: khangjungle' },
    { email: 'mai.pham@example.com', username: 'MaiChillPlay', bio: 'Chơi game để thư giãn, ưu tiên team không toxic.', playStyle: 'Casual', createdDaysAgo: 17, lastActiveDaysAgo: 0, contactInfo: 'Discord: maichill' },
    { email: 'nam.vo@example.com', username: 'NamTFT', bio: 'Đam mê cờ nhân phẩm, thích bàn chiến thuật sau mỗi trận.', playStyle: 'Strategic', createdDaysAgo: 15, lastActiveDaysAgo: 0, contactInfo: 'Discord: namtft' },
    { email: 'thao.bui@example.com', username: 'ThaoAOV', bio: 'Main rừng Liên Quân, tìm squad leo rank cuối tuần.', playStyle: 'Aggressive', createdDaysAgo: 14, lastActiveDaysAgo: 1, contactInfo: 'Discord: thaoaov' },
    { email: 'phuc.nguyen@example.com', username: 'PhucFCOnline', bio: 'FC Online mỗi tối, thích đá giao hữu và giải phong trào.', playStyle: 'Competitive', createdDaysAgo: 12, lastActiveDaysAgo: 1, contactInfo: 'Discord: phucfo4' },
    { email: 'an.tran@example.com', username: 'AnFreeFire', bio: 'Squad sinh tồn, call vui vẻ, ưu tiên người mới.', playStyle: 'Casual', createdDaysAgo: 11, lastActiveDaysAgo: 0, contactInfo: 'Discord: anfreefire' },
    { email: 'duc.le@example.com', username: 'DucCS2', bio: 'Ưa thích Premier và luyện smoke theo đội hình.', playStyle: 'Hardcore', createdDaysAgo: 9, lastActiveDaysAgo: 0, contactInfo: 'Discord: duccs2' },
    { email: 'yen.ngo@example.com', username: 'YenWildRift', bio: 'ADC main, online đều sau 20:30.', playStyle: 'Competitive', createdDaysAgo: 8, lastActiveDaysAgo: 0, contactInfo: 'Discord: yenwr' },
    { email: 'bao.dang@example.com', username: 'BaoValorant', bio: 'Sentinel player, thích xếp hạng nhưng tôn trọng đồng đội.', playStyle: 'Competitive', createdDaysAgo: 7, lastActiveDaysAgo: 0, contactInfo: 'Discord: baoval' },
    { email: 'nhat.pham@example.com', username: 'NhatClash', bio: 'Đánh được nhiều lane, đang tìm team Clash ổn định.', playStyle: 'Flexible', createdDaysAgo: 6, lastActiveDaysAgo: 1, contactInfo: 'Discord: nhatclash' },
    { email: 'quynh.dao@example.com', username: 'QuynhCoop', bio: 'Co-op Genshin và Wild Rift, chơi nhẹ nhàng.', playStyle: 'Casual', createdDaysAgo: 5, lastActiveDaysAgo: 0, contactInfo: 'Discord: quynhcoop' },
    { email: 'long.vu@example.com', username: 'LongNightOwl', bio: 'Thường online khuya, thích các trận rank sau 23h.', playStyle: 'Night owl', createdDaysAgo: 4, lastActiveDaysAgo: 0, contactInfo: 'Discord: longnight' },
    { email: 'duy.nguyen@example.com', username: 'DuySoloTop', bio: 'Đang tạm nghỉ để nhìn lại cách giao tiếp trong game.', playStyle: 'Hardcore', createdDaysAgo: 19, lastActiveDaysAgo: 6, warnCount: 3, tempBannedUntil: at(-5, 23), contactInfo: 'Discord: duytop' },
    { email: 'toxic.player@example.com', username: 'ToxicYasuo', bio: 'Tài khoản mẫu ở trạng thái bị cấm để demo moderation.', playStyle: 'Aggressive', createdDaysAgo: 23, lastActiveDaysAgo: 12, status: 'BANNED', warnCount: 5 },
  ];

  for (const user of userData) {
    const createdAt = at(user.createdDaysAgo, 9 + (user.createdDaysAgo % 8), 15);
    const record = await prisma.user.create({
      data: {
        email: user.email,
        username: user.username,
        passwordHash,
        avatarUrl: avatar(user.username),
        role: user.role ?? 'USER',
        status: user.status ?? 'ACTIVE',
        warnCount: user.warnCount ?? 0,
        tempBannedUntil: user.tempBannedUntil ?? null,
        createdAt,
        profile: {
          create: {
            bio: user.bio,
            playStyle: user.playStyle,
            contactInfo: user.contactInfo ?? null,
            timezone: 'Asia/Ho_Chi_Minh',
            lastActiveAt: at(user.lastActiveDaysAgo, 19 + (user.createdDaysAgo % 4), 10),
          },
        },
      },
    });
    users[user.username] = record;
  }

  if (preservedUser) {
    users.TestUser_Seed = preservedUser;
    await prisma.userProfile.upsert({
      where: { userId: preservedUser.id },
      update: { lastActiveAt: at(0, 21, 5) },
      create: {
        userId: preservedUser.id,
        bio: 'Tài khoản Google đang dùng để demo TeamZoneVN.',
        playStyle: 'Linh hoạt',
        timezone: 'Asia/Ho_Chi_Minh',
        lastActiveAt: at(0, 21, 5),
      },
    });
  }

  console.log(`Created ${Object.keys(users).length} demo users.`);

  // Keep this game catalogue, image slugs and number of games unchanged.
  const gameData = [
    { name: 'Valorant', slug: 'valorant', platforms: [Platform.PC] },
    { name: 'League of Legends', slug: 'lienminh', platforms: [Platform.PC] },
    { name: 'Genshin Impact', slug: 'genshin', platforms: [Platform.PC, Platform.MOBILE] },
    { name: 'Wild Rift', slug: 'tocchien', platforms: [Platform.MOBILE] },
    { name: 'PUBG Mobile', slug: 'pubg-mobile', platforms: [Platform.MOBILE] },
    { name: 'CS2', slug: 'cs2', platforms: [Platform.PC] },
    { name: 'FC ONLINE 4', slug: 'fconline', platforms: [Platform.PC, Platform.CONSOLE] },
    { name: 'Teamfight Tactics', slug: 'dautruongchanli', platforms: [Platform.PC, Platform.MOBILE] },
    { name: 'Free Fire', slug: 'freefire', platforms: [Platform.MOBILE] },
    { name: 'Arena of Valor', slug: 'lienquan', platforms: [Platform.MOBILE] },
  ];
  const games: Record<string, { id: string }> = {};
  for (const game of gameData) {
    games[game.name] = await prisma.game.create({
      data: {
        name: game.name,
        isActive: true,
        platforms: game.platforms,
        iconUrl: `icons/${game.slug}.png`,
        bannerUrl: `banners/${game.slug}-banner.jpg`,
        createdAt: at(30, 8),
      },
    });
  }

  const profiles: Array<[string, string]> = [
    ['MinhMidLane', 'Valorant'], ['MinhMidLane', 'League of Legends'], ['LinhGenshin', 'Genshin Impact'],
    ['TuanFpsGod', 'Valorant'], ['TuanFpsGod', 'CS2'], ['HuongSupport', 'Wild Rift'], ['HuongSupport', 'Arena of Valor'],
    ['KhangJungle', 'League of Legends'], ['KhangJungle', 'Teamfight Tactics'], ['MaiChillPlay', 'Genshin Impact'],
    ['MaiChillPlay', 'PUBG Mobile'], ['NamTFT', 'Teamfight Tactics'], ['ThaoAOV', 'Arena of Valor'],
    ['PhucFCOnline', 'FC ONLINE 4'], ['AnFreeFire', 'Free Fire'], ['DucCS2', 'CS2'], ['DucCS2', 'Valorant'],
    ['YenWildRift', 'Wild Rift'], ['BaoValorant', 'Valorant'], ['NhatClash', 'League of Legends'],
    ['QuynhCoop', 'Genshin Impact'], ['QuynhCoop', 'Wild Rift'], ['LongNightOwl', 'PUBG Mobile'],
    ['LongNightOwl', 'Free Fire'], ['TestUser_Seed', 'Valorant'], ['TestUser_Seed', 'Genshin Impact'],
  ];
  await prisma.userGameProfile.createMany({
    data: profiles.map(([username, game]) => ({ userId: users[username].id, gameId: games[game].id })),
  });

  const zoneData: DemoZone[] = [
    { key: 'valorant-rank', owner: 'MinhMidLane', game: 'Valorant', title: 'Leo rank Ascendant tối nay', description: 'Cần 2 bạn chơi ổn định, có mic và giao tiếp tích cực. Bắt đầu lúc 20:30.', requiredPlayers: 2, createdDaysAgo: 0, autoApprove: true, tags: ['Leo Rank', 'Có Mic', 'Tối Nay'], contacts: [{ type: 'DISCORD', value: 'minhmid' }] },
    { key: 'genshin-boss', owner: 'LinhGenshin', game: 'Genshin Impact', title: 'Co-op farm boss cuối tuần', description: 'Farm boss, nhặt tài nguyên và hỗ trợ người chơi mới. Không yêu cầu build mạnh.', requiredPlayers: 3, createdDaysAgo: 0, tags: ['Chill', 'Người Mới', 'Co-op'], contacts: [{ type: 'INGAME', value: '812345678' }] },
    { key: 'cs2-premier', owner: 'DucCS2', game: 'CS2', title: 'Premier 15k+ cần đồng đội', description: 'Tìm team hiểu map, có smoke cơ bản và ưu tiên phối hợp.', requiredPlayers: 3, createdDaysAgo: 1, tags: ['Leo Rank', 'Competitive', 'Có Mic'], contacts: [{ type: 'DISCORD', value: 'duccs2' }] },
    { key: 'wildrift-duo', owner: 'HuongSupport', game: 'Wild Rift', title: 'Duo bot lane leo rank', description: 'Main support tìm ADC đánh chắc tay, chơi đều các buổi tối.', requiredPlayers: 1, createdDaysAgo: 1, autoApprove: true, tags: ['Duo', 'Leo Rank', 'Buổi Tối'], contacts: [{ type: 'INGAME', value: 'HuongSupport#WR' }] },
    { key: 'aov-jungle', owner: 'ThaoAOV', game: 'Arena of Valor', title: 'Cần rừng leo Cao Thủ', description: 'Squad thân thiện, cần rừng call mục tiêu tốt để leo rank cuối tuần.', requiredPlayers: 1, createdDaysAgo: 2, tags: ['Leo Rank', 'Có Mic', 'Cuối Tuần'], contacts: [{ type: 'DISCORD', value: 'thaoaov' }] },
    { key: 'lol-clash', owner: 'NhatClash', game: 'League of Legends', title: 'Tuyển team Clash cuối tuần', description: 'Cần Top, AD và Support cho đội Clash. Có lịch tập trước giải.', requiredPlayers: 3, createdDaysAgo: 2, tags: ['Tournament', 'Clash', 'Có Mic'], contacts: [{ type: 'DISCORD', value: 'nhatclash' }] },
    { key: 'ff-squad', owner: 'AnFreeFire', game: 'Free Fire', title: 'Squad sinh tồn 21h', description: 'Tìm đồng đội chơi vui, ưu tiên phối hợp và không bỏ trận.', requiredPlayers: 2, createdDaysAgo: 3, tags: ['Chill', 'Squad', 'Buổi Tối'], contacts: [{ type: 'INGAME', value: 'AnFreeFire' }] },
    { key: 'tft-coach', owner: 'NamTFT', game: 'Teamfight Tactics', title: 'Xem bài TFT và leo rank cùng nhau', description: 'Cùng phân tích meta, line up và chia sẻ cách xử lý từng round.', requiredPlayers: 4, createdDaysAgo: 3, tags: ['Chiến Thuật', 'Leo Rank', 'Học Hỏi'], contacts: [{ type: 'DISCORD', value: 'namtft' }] },
    { key: 'fo4-friendly', owner: 'PhucFCOnline', game: 'FC ONLINE 4', title: 'Đá giao hữu và luyện team color', description: 'Tìm bạn đá giao hữu, chia sẻ đội hình và tham gia giải nội bộ.', requiredPlayers: 2, createdDaysAgo: 4, tags: ['Giao Lưu', 'Chill', 'FC Online'], contacts: [{ type: 'DISCORD', value: 'phucfo4' }] },
    { key: 'pubg-mobile', owner: 'LongNightOwl', game: 'PUBG Mobile', title: 'Squad rank sau 23h', description: 'Dành cho cú đêm: call nhỏ, chơi chiến thuật và ưu tiên sống lâu.', requiredPlayers: 3, createdDaysAgo: 4, tags: ['Chơi Đêm', 'Squad', 'Có Mic'], contacts: [{ type: 'DISCORD', value: 'longnight' }] },
    { key: 'valorant-unrated', owner: 'BaoValorant', game: 'Valorant', title: 'Unrated làm quen bạn mới', description: 'Không áp lực thắng thua, phù hợp người mới muốn tập map và aim.', requiredPlayers: 4, createdDaysAgo: 5, tags: ['Người Mới', 'Vui Vẻ', 'Chill'], contacts: [{ type: 'DISCORD', value: 'baoval' }] },
    { key: 'genshin-events', owner: 'QuynhCoop', game: 'Genshin Impact', title: 'Làm event và khám phá map', description: 'Đi event mới, mở rương và hỗ trợ nhiệm vụ co-op.', requiredPlayers: 3, createdDaysAgo: 6, autoApprove: true, tags: ['Co-op', 'Khám Phá', 'Chill'], contacts: [{ type: 'INGAME', value: '823456789' }] },
    { key: 'lol-flex', owner: 'KhangJungle', game: 'League of Legends', title: 'Flex 5 người tối thứ Sáu', description: 'Tuyển các lane còn thiếu để đánh Flex, ưu tiên giao tiếp văn minh.', requiredPlayers: 3, createdDaysAgo: 7, tags: ['Flex', 'Có Mic', 'Buổi Tối'], contacts: [{ type: 'DISCORD', value: 'khangjungle' }] },
    { key: 'wildrift-casual', owner: 'YenWildRift', game: 'Wild Rift', title: 'Rank Vàng - Bạch Kim chơi vui', description: 'Tìm duo hoặc trio không toxic, hỗ trợ nhau lên hạng.', requiredPlayers: 2, createdDaysAgo: 8, tags: ['Duo', 'Vui Vẻ', 'Không Toxic'], contacts: [{ type: 'INGAME', value: 'YenWR#VN' }] },
    { key: 'pubg-newbie', owner: 'MaiChillPlay', game: 'PUBG Mobile', title: 'PUBG Mobile cho người mới', description: 'Hướng dẫn cơ bản, chơi TPP vui vẻ, không cần KD cao.', requiredPlayers: 3, createdDaysAgo: 10, tags: ['Người Mới', 'Chill', 'Co-op'], contacts: [{ type: 'DISCORD', value: 'maichill' }] },
    { key: 'cs2-training', owner: 'TuanFpsGod', game: 'CS2', title: 'Luyện aim và smoke CS2', description: 'Hẹn 2-3 bạn cùng luyện aim routine và smoke các map cơ bản.', requiredPlayers: 3, createdDaysAgo: 12, tags: ['Luyện Tập', 'Competitive', 'Có Mic'], contacts: [{ type: 'DISCORD', value: 'tuanfps' }] },
    { key: 'aov-full', owner: 'HuongSupport', game: 'Arena of Valor', title: 'Team Liên Quân đã đủ squad', description: 'Zone mẫu đã đủ thành viên để hiển thị trạng thái FULL trên app.', requiredPlayers: 2, createdDaysAgo: 14, status: 'FULL', tags: ['Leo Rank', 'Squad', 'Có Mic'], contacts: [{ type: 'INGAME', value: 'HuongSupport' }] },
    { key: 'fo4-weekend', owner: 'PhucFCOnline', game: 'FC ONLINE 4', title: 'Giải mini FC Online Chủ nhật', description: 'Tổ chức giải nội bộ 8 người, đăng ký trước tối thứ Bảy.', requiredPlayers: 6, createdDaysAgo: 16, tags: ['Tournament', 'Giao Lưu', 'Cuối Tuần'], contacts: [{ type: 'DISCORD', value: 'phucfo4' }] },
  ];

  const zones: Record<string, { id: string }> = {};
  for (const zone of zoneData) {
    zones[zone.key] = await prisma.zone.create({
      data: {
        ownerId: users[zone.owner].id,
        gameId: games[zone.game].id,
        title: zone.title,
        description: zone.description,
        requiredPlayers: zone.requiredPlayers,
        status: zone.status ?? 'OPEN',
        autoApprove: zone.autoApprove ?? false,
        createdAt: at(zone.createdDaysAgo, 18 + (zone.createdDaysAgo % 4), 20),
        tags: { create: zone.tags.map((name) => ({ tag: { connectOrCreate: { where: { name }, create: { name } } } })) },
        contacts: { create: zone.contacts },
      },
    });
  }

  const groupDefinitions = [
    { zone: 'valorant-rank', game: 'Valorant', leader: 'MinhMidLane', members: ['BaoValorant', 'TestUser_Seed'], daysAgo: 0 },
    { zone: 'genshin-boss', game: 'Genshin Impact', leader: 'LinhGenshin', members: ['QuynhCoop', 'MaiChillPlay'], daysAgo: 0 },
    { zone: 'cs2-premier', game: 'CS2', leader: 'DucCS2', members: ['TuanFpsGod', 'MinhMidLane'], daysAgo: 1 },
    { zone: 'lol-clash', game: 'League of Legends', leader: 'NhatClash', members: ['KhangJungle', 'HuongSupport', 'TestUser_Seed'], daysAgo: 2 },
    { zone: 'aov-full', game: 'Arena of Valor', leader: 'HuongSupport', members: ['ThaoAOV', 'YenWildRift'], daysAgo: 14 },
  ];
  const groups: Record<string, { id: string }> = {};
  for (const definition of groupDefinitions) {
    groups[definition.zone] = await prisma.group.create({
      data: {
        zoneId: zones[definition.zone].id,
        leaderId: users[definition.leader].id,
        gameId: games[definition.game].id,
        createdAt: at(definition.daysAgo, 20, 30),
        members: { create: [
          { userId: users[definition.leader].id, role: GroupMemberRole.LEADER, joinedAt: at(definition.daysAgo, 20, 30) },
          ...definition.members.map((username, index) => ({ userId: users[username].id, role: GroupMemberRole.MEMBER, joinedAt: at(definition.daysAgo, 20, 35 + index * 3) })),
        ] },
      },
    });
  }

  const messageSets = [
    ['valorant-rank', [['MinhMidLane', 'Chào mọi người, 20:30 mình bắt đầu nhé.'], ['BaoValorant', 'Mình chơi Sentinel, đã sẵn sàng.'], ['TestUser_Seed', 'Mình vào call sau 5 phút nhé!']]],
    ['genshin-boss', [['LinhGenshin', 'Tối nay farm boss tuần nha mọi người.'], ['QuynhCoop', 'Mình mang healer, mọi người cứ chọn DPS.'], ['MaiChillPlay', 'Ok, cho mình tham gia với!']]],
    ['cs2-premier', [['DucCS2', 'Ai nhớ smoke Mirage thì call giúp mình nhé.'], ['TuanFpsGod', 'Có, mình lo mid window.'], ['MinhMidLane', 'Mình giữ A site, vào trận thôi.']]],
    ['lol-clash', [['NhatClash', 'Tối nay tập 2 ván trước Clash nhé.'], ['KhangJungle', 'Mình có thể jungle hoặc top.'], ['HuongSupport', 'Mình chốt support nha.'], ['TestUser_Seed', 'Tuyệt, mình nhận mid.']]],
    ['aov-full', [['HuongSupport', 'Cảm ơn mọi người đã vào đủ team.'], ['ThaoAOV', 'Tối mai mình leo tiếp nhé.'], ['YenWildRift', 'Đồng ý, 20:00 mình online.']]],
  ] as const;
  for (const [zoneKey, messages] of messageSets) {
    const group = groups[zoneKey];
    const baseDaysAgo = groupDefinitions.find((item) => item.zone === zoneKey)!.daysAgo;
    await prisma.message.createMany({
      data: messages.map(([sender, content], index) => ({
        groupId: group.id,
        senderId: users[sender].id,
        content,
        createdAt: at(baseDaysAgo, 20 + (index % 2), 35 + index * 4),
      })),
    });
  }

  const friendships: Array<[string, string, FriendStatus, number]> = [
    ['MinhMidLane', 'TuanFpsGod', 'ACCEPTED', 18], ['MinhMidLane', 'BaoValorant', 'ACCEPTED', 6], ['LinhGenshin', 'QuynhCoop', 'ACCEPTED', 5],
    ['LinhGenshin', 'MaiChillPlay', 'ACCEPTED', 4], ['HuongSupport', 'YenWildRift', 'ACCEPTED', 7], ['KhangJungle', 'NhatClash', 'ACCEPTED', 2],
    ['ThaoAOV', 'HuongSupport', 'ACCEPTED', 13], ['PhucFCOnline', 'AnFreeFire', 'ACCEPTED', 8], ['DucCS2', 'TuanFpsGod', 'ACCEPTED', 3],
    ['TestUser_Seed', 'MinhMidLane', 'ACCEPTED', 1], ['LongNightOwl', 'AnFreeFire', 'PENDING', 0], ['BaoValorant', 'DucCS2', 'PENDING', 1],
  ];
  await prisma.friendship.createMany({ data: friendships.map(([sender, receiver, status, daysAgo]) => ({ senderId: users[sender].id, receiverId: users[receiver].id, status, createdAt: at(daysAgo, 17, 15) })) });

  const likes = [
    ['MinhMidLane', 'TuanFpsGod', 0], ['MinhMidLane', 'BaoValorant', 1], ['MinhMidLane', 'NhatClash', 2], ['MinhMidLane', 'HuongSupport', 3],
    ['LinhGenshin', 'QuynhCoop', 0], ['LinhGenshin', 'MaiChillPlay', 1], ['TuanFpsGod', 'DucCS2', 1], ['HuongSupport', 'YenWildRift', 2],
    ['KhangJungle', 'NhatClash', 2], ['PhucFCOnline', 'AnFreeFire', 4], ['TestUser_Seed', 'MinhMidLane', 0], ['TestUser_Seed', 'LinhGenshin', 0],
  ] as const;
  await prisma.userLike.createMany({ data: likes.map(([user, liker, daysAgo]) => ({ userId: users[user].id, likerId: users[liker].id, createdAt: at(daysAgo, 21, 10) })) });

  await prisma.zoneJoinRequest.createMany({
    data: [
      { zoneId: zones['wildrift-duo'].id, userId: users.YenWildRift.id, status: 'PENDING', createdAt: at(0, 19, 20) },
      { zoneId: zones['ff-squad'].id, userId: users.LongNightOwl.id, status: 'PENDING', createdAt: at(1, 22, 10) },
      { zoneId: zones['tft-coach'].id, userId: users.KhangJungle.id, status: 'APPROVED', createdAt: at(2, 20, 5) },
      { zoneId: zones['pubg-newbie'].id, userId: users.TestUser_Seed.id, status: 'APPROVED', createdAt: at(6, 18, 0) },
      { zoneId: zones['fo4-weekend'].id, userId: users.MinhMidLane.id, status: 'REJECTED', createdAt: at(8, 20, 0) },
    ],
  });
  await prisma.zoneInvite.createMany({
    data: [
      { zoneId: zones['valorant-rank'].id, inviterId: users.MinhMidLane.id, inviteeId: users.TuanFpsGod.id, status: ZoneInviteStatus.PENDING, createdAt: at(0, 18, 45) },
      { zoneId: zones['lol-flex'].id, inviterId: users.KhangJungle.id, inviteeId: users.NhatClash.id, status: ZoneInviteStatus.ACCEPTED, createdAt: at(2, 19, 15) },
      { zoneId: zones['genshin-events'].id, inviterId: users.QuynhCoop.id, inviteeId: users.LinhGenshin.id, status: ZoneInviteStatus.ACCEPTED, createdAt: at(5, 20, 30) },
      { zoneId: zones['pubg-mobile'].id, inviterId: users.LongNightOwl.id, inviteeId: users.AnFreeFire.id, status: ZoneInviteStatus.DECLINED, createdAt: at(3, 23, 20) },
    ],
  });
  await prisma.userBlock.create({ data: { blockerId: users.MaiChillPlay.id, blockedId: users.ToxicYasuo.id, createdAt: at(10, 10) } });
  await prisma.quickMatchQueue.createMany({
    data: [
      { userId: users.BaoValorant.id, gameId: games.Valorant.id, requiredPlayers: 2, createdAt: at(0, 20, 15) },
      { userId: users.YenWildRift.id, gameId: games['Wild Rift'].id, requiredPlayers: 1, createdAt: at(0, 20, 40) },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { userId: users.YenWildRift.id, type: NotificationType.JOIN_REQUEST, title: 'Có yêu cầu tham gia Zone', data: { zoneTitle: 'Duo bot lane leo rank', requester: 'YenWildRift' }, isRead: false, createdAt: at(0, 19, 20) },
      { userId: users.MinhMidLane.id, type: NotificationType.ZONE_INVITE, title: 'Lời mời Zone đang chờ phản hồi', data: { invitee: 'TuanFpsGod', zoneTitle: 'Leo rank Ascendant tối nay' }, isRead: false, createdAt: at(0, 18, 45) },
      { userId: users.TestUser_Seed.id, type: NotificationType.GROUP_FORMED, title: 'Bạn đã tham gia nhóm Valorant', data: { groupId: groups['valorant-rank'].id }, isRead: true, createdAt: at(0, 20, 40) },
      { userId: users.LinhGenshin.id, type: NotificationType.NEW_MESSAGE, title: 'Tin nhắn mới trong nhóm Genshin', data: { groupId: groups['genshin-boss'].id }, isRead: false, createdAt: at(0, 21, 5) },
      { userId: users.NhatClash.id, type: NotificationType.FRIEND_ACCEPTED, title: 'KhangJungle đã chấp nhận lời mời kết bạn', data: { userId: users.KhangJungle.id }, isRead: true, createdAt: at(2, 17, 15) },
      { userId: users.DuySoloTop.id, type: NotificationType.ACCOUNT_BANNED, title: 'Tài khoản đang bị tạm khóa', data: { expiresAt: at(-5, 23).toISOString() }, isRead: false, createdAt: at(5, 9, 0) },
    ],
  });

  const resolvedReport = await prisma.report.create({
    data: {
      reporterId: users.MaiChillPlay.id,
      targetType: 'USER',
      targetId: users.ToxicYasuo.id,
      reason: 'Ngôn từ công kích và hành vi gây khó chịu trong quá trình ghép đội.',
      severity: ReportSeverity.HIGH,
      status: ReportStatus.RESOLVED,
      action: ModerationAction.BANNED,
      resolutionNote: 'Đã xác minh và xử lý theo quy định cộng đồng.',
      createdAt: at(12, 21),
      resolvedAt: at(11, 10),
      resolvedById: users.Admin_Master.id,
    },
  });
  const openReport = await prisma.report.create({
    data: {
      reporterId: users.MinhMidLane.id,
      targetType: 'ZONE',
      targetId: zones['cs2-training'].id,
      reason: 'Nội dung Zone có ngôn ngữ chưa phù hợp, cần admin kiểm tra.',
      severity: ReportSeverity.MEDIUM,
      status: ReportStatus.OPEN,
      createdAt: at(1, 22),
    },
  });
  const tempBanLog = await prisma.moderationLog.create({
    data: { adminId: users.Admin_Master.id, targetUserId: users.DuySoloTop.id, reportId: openReport.id, action: ModerationAction.TEMP_BANNED, reason: 'Vi phạm quy tắc giao tiếp sau nhiều lần cảnh báo.', tempBanDays: 7, expiresAt: at(-5, 23), createdAt: at(5, 9) },
  });
  const banLog = await prisma.moderationLog.create({
    data: { adminId: users.Admin_Master.id, targetUserId: users.ToxicYasuo.id, reportId: resolvedReport.id, action: ModerationAction.BANNED, reason: 'Hành vi vi phạm nghiêm trọng đã được xác minh.', createdAt: at(11, 10) },
  });
  await prisma.appeal.createMany({
    data: [
      { userId: users.DuySoloTop.id, moderationLogId: tempBanLog.id, reason: 'Mình mong được xem xét lại và cam kết tuân thủ quy định cộng đồng.', status: AppealStatus.PENDING, createdAt: at(4, 14) },
      { userId: users.ToxicYasuo.id, moderationLogId: banLog.id, reason: 'Xin được kiểm tra lại kết quả xử lý tài khoản.', status: AppealStatus.REJECTED, adminNote: 'Bằng chứng đã được đối chiếu đầy đủ.', createdAt: at(10, 15), resolvedAt: at(9, 11), resolvedById: users.Admin_Master.id },
    ],
  });

  console.log(`Created ${gameData.length} unchanged games, ${zoneData.length} zones and ${Object.keys(groups).length} groups.`);
  console.log('Seeding completed successfully.');
  console.log(`Demo password: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
