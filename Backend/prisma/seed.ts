import { PrismaClient, Platform, RankLevel, GroupMemberRole, ZoneStatus, ReportSeverity } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Super Demo Seeding...');

  // 0. Clean up existing data
  const MY_USER_ID = 'b7c957ce-ba9a-4732-a9ae-609f6f832ff1';
  const myUserExists = await prisma.user.findFirst({ where: { id: MY_USER_ID } }).then(Boolean);
  console.log(myUserExists ? '🧹 Cleaning up existing data (keeping Google account data)...' : '🧹 Cleaning up existing data (fresh DB)...');

  await prisma.message.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.zoneJoinRequest.deleteMany({ where: myUserExists ? { userId: { not: MY_USER_ID } } : {} });
  await prisma.zoneContactMethod.deleteMany();
  await prisma.zoneTagRelation.deleteMany();
  await prisma.zoneInvite.deleteMany();
  await prisma.zone.deleteMany({ where: myUserExists ? { ownerId: { not: MY_USER_ID } } : {} });
  await prisma.quickMatchQueue.deleteMany();
  await prisma.userGameProfile.deleteMany({ where: myUserExists ? { userId: { not: MY_USER_ID } } : {} });
  await prisma.game.deleteMany();
  await prisma.userProfile.deleteMany({ where: myUserExists ? { userId: { not: MY_USER_ID } } : {} });
  await prisma.refreshToken.deleteMany({ where: myUserExists ? { userId: { not: MY_USER_ID } } : {} });
  await prisma.passwordResetToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.userLike.deleteMany();

  console.log('✅ Cleaned up existing data');

  // 1. Create Users
  console.log('👥 Creating users...');
  const passwordHash = await bcrypt.hash('User123456', 12);
  const users: any = {};

  const myUser = await prisma.user.findFirst({ where: { id: MY_USER_ID } });
  const userData = [
    { email: 'test-demo@teamzonevn.com', username: 'TestUser_Seed', role: 'USER', bio: 'Tài khoản demo (dùng khi chưa đăng nhập Google)', style: 'Casual' },
    { email: 'admin@teamzonevn.com', username: 'Admin_Master', role: 'ADMIN', bio: 'Hệ thống TeamZoneVN', style: 'Competitive' },
    { email: 'son.pham@example.com', username: 'SonGoku_VN', role: 'USER', bio: 'Main Mid, tìm team leo Rank Cao Thủ', style: 'Aggressive' },
    { email: 'linh.nguyen@example.com', username: 'Linh_Xinh_Genshin', role: 'USER', bio: 'Chỉ thích đi ngắm cảnh và đánh Boss', style: 'Casual' },
    { email: 'tuan.tran@example.com', username: 'Tuan_Fps_God', role: 'USER', bio: 'Bắn mọi thể loại FPS', style: 'Competitive' },
    { email: 'huong.le@example.com', username: 'Huong_Support', role: 'USER', bio: 'Main SP, không toxic, chơi vui là chính', style: 'Supportive' },
    { email: 'duy.nguyen@example.com', username: 'Duy_Solo_Top', role: 'USER', bio: 'Thử thách 100 ngày leo rank', style: 'Hardcore' },
  ];

  for (const u of userData) {
    users[u.username] = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        username: u.username,
        passwordHash,
        role: u.role as any,
        profile: {
          create: {
            bio: u.bio,
            playStyle: u.style,
            timezone: 'Asia/Ho_Chi_Minh',
          },
        },
      },
    });
  }
  if (myUser) {
    users['TestUser_Seed'] = myUser;
    console.log(`✅ Found existing Google account: ${myUser.username} (${myUser.email})`);
  } else {
    console.log(`✅ Created demo TestUser_Seed (chưa có Google login)`);
  }
  console.log(`✅ Created/found ${userData.length} users`);

  // 2. Create Games
  console.log('🎮 Creating games...');
  const STORAGE_BASE_URL = 'https://hrvxrxnkbcqrftagzuso.supabase.co/storage/v1/object/public/game-assets';

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

  const games: any = {};
  for (const g of gameData) {
    games[g.name] = await prisma.game.create({
      data: {
        name: g.name,
        isActive: true,
        platforms: g.platforms,
        // Sử dụng slug để khớp với tên file bạn đã upload
        iconUrl: `${STORAGE_BASE_URL}/icons/${g.slug}.png`,
        bannerUrl: `${STORAGE_BASE_URL}/banners/${g.slug}-banner.jpg`,
      },
    });
  }
  console.log(`✅ Created ${gameData.length} games with your custom images`);

  // 3. User Game Profiles
  console.log('📊 Creating game profiles...');
  await prisma.userGameProfile.createMany({
    data: [
      { userId: users['SonGoku_VN'].id, gameId: games['Valorant'].id, rankLevel: RankLevel.ADVANCED },
      { userId: users['SonGoku_VN'].id, gameId: games['League of Legends'].id, rankLevel: RankLevel.PRO },
      { userId: users['Linh_Xinh_Genshin'].id, gameId: games['Genshin Impact'].id, rankLevel: RankLevel.INTERMEDIATE },
      { userId: users['Tuan_Fps_God'].id, gameId: games['Valorant'].id, rankLevel: RankLevel.PRO },
      { userId: users['Tuan_Fps_God'].id, gameId: games['CS2'].id, rankLevel: RankLevel.ADVANCED },
      { userId: users['Huong_Support'].id, gameId: games['Wild Rift'].id, rankLevel: RankLevel.INTERMEDIATE },
      { userId: users['Huong_Support'].id, gameId: games['Arena of Valor'].id, rankLevel: RankLevel.ADVANCED },
      { userId: users['Duy_Solo_Top'].id, gameId: games['League of Legends'].id, rankLevel: RankLevel.ADVANCED },
      { userId: users['Duy_Solo_Top'].id, gameId: games['Free Fire'].id, rankLevel: RankLevel.INTERMEDIATE },
    ]
  });

  // 4. Create Zones
  console.log('🌐 Creating zones...');
  const zoneData = [
    {
      owner: 'SonGoku_VN', game: 'Valorant', title: 'Leo Rank Ascendant/Immortal',
      desc: 'Cần Duelist hoặc Sentinel cứng, có mic Discord giao tiếp tốt. Chơi nghiêm túc không toxic.',
      min: RankLevel.ADVANCED, max: RankLevel.PRO, players: 2,
      tags: ['Leo Rank', 'Có Mic', 'Hardcore'],
      contacts: [{ type: 'DISCORD', value: 'SonGoku#1234' }]
    },
    {
      owner: 'Linh_Xinh_Genshin', game: 'Genshin Impact', title: 'Farm Thánh Di Vật - Chill',
      desc: 'Cần tìm bạn đi coop farm bí cảnh, mình hụt damage quá. Newbie friendly!',
      min: RankLevel.BEGINNER, max: RankLevel.ADVANCED, players: 3,
      tags: ['Chill', 'Người Mới', 'Vui Vẻ'],
      contacts: [{ type: 'INGAME', value: '812345678' }]
    },
    {
      owner: 'Tuan_Fps_God', game: 'CS2', title: 'Premier Mode 15k+ Elo',
      desc: 'Tìm 3 ông bắn Premier, hiểu map, smoke chuẩn. Vào việc luôn.',
      min: RankLevel.ADVANCED, max: RankLevel.PRO, players: 3,
      tags: ['Leo Rank', 'Pro', 'Có Mic'],
      contacts: [{ type: 'DISCORD', value: 'TuanFPS#9999' }]
    },
    {
      owner: 'Huong_Support', game: 'Wild Rift', title: 'Tìm AD leo rank Vàng',
      desc: 'Mình main Seraphine/Lulu, tìm AD bắn chắc tay. Chơi buổi tối hàng ngày nhé.',
      min: RankLevel.BEGINNER, max: RankLevel.INTERMEDIATE, players: 1,
      tags: ['Duo', 'Vui Vẻ', 'Chơi Đêm'],
      contacts: [{ type: 'INGAME', value: 'HuongCute#WR' }]
    },
    {
      owner: 'Huong_Support', game: 'Arena of Valor', title: 'Leo Rank Cao Thủ - Cần Rừng',
      desc: 'Đang ở rank Tinh Anh, tìm rừng cứng gánh team leo Cao Thủ. Ko toxic nhé.',
      min: RankLevel.INTERMEDIATE, max: RankLevel.ADVANCED, players: 1,
      tags: ['Leo Rank', 'Có Mic', 'Vui Vẻ'],
      contacts: [{ type: 'INGAME', value: 'HuongSupport' }]
    },
    {
      owner: 'Duy_Solo_Top', game: 'League of Legends', title: 'Custom 5vs5 - Net Cỏ',
      desc: 'Team đang thiếu 1 người đi rừng để làm kèo custom với hội bạn. Ai rảnh vào giao lưu!',
      min: RankLevel.INTERMEDIATE, max: RankLevel.ADVANCED, players: 1,
      tags: ['Giao Lưu', 'Custom', 'Có Mic'],
      contacts: [{ type: 'DISCORD', value: 'DuyTop#111' }]
    },
    {
      owner: 'Duy_Solo_Top', game: 'Free Fire', title: 'Squad Sinh Tồn - Tối Nay',
      desc: 'Tìm 2 ông bắn Squad sinh tồn vui vẻ, mình bắn giải trí thôi.',
      min: RankLevel.BEGINNER, max: RankLevel.INTERMEDIATE, players: 2,
      tags: ['Vui Vẻ', 'Chill'],
      contacts: [{ type: 'INGAME', value: 'DuyFF' }]
    },
    {
      owner: 'SonGoku_VN', game: 'League of Legends', title: 'Clash Weekend - Tìm Team',
      desc: 'Cần tìm team cho giải Clash cuối tuần này. Mình đánh được mọi lane nhưng tốt nhất là Mid.',
      min: RankLevel.ADVANCED, max: RankLevel.PRO, players: 4,
      tags: ['Tournament', 'Leo Rank', 'Hardcore'],
      contacts: [{ type: 'DISCORD', value: 'SonGoku#1234' }]
    },
    {
      owner: 'Tuan_Fps_God', game: 'Valorant', title: 'Squad 5 bắn Unrated vui vẻ',
      desc: 'Bắn khuya cho vui, không quan trọng thắng thua, chủ yếu chém gió.',
      min: RankLevel.BEGINNER, max: RankLevel.PRO, players: 4,
      tags: ['Vui Vẻ', 'Chill', 'Chơi Đêm'],
      contacts: [{ type: 'DISCORD', value: 'TuanFPS#9999' }]
    }
  ];

  const createdZones: any[] = [];
  for (const z of zoneData) {
    const zone = await prisma.zone.create({
      data: {
        ownerId: users[z.owner].id,
        gameId: games[z.game].id,
        title: z.title,
        description: z.desc,
        minRankLevel: z.min,
        maxRankLevel: z.max,
        requiredPlayers: z.players,
        status: ZoneStatus.OPEN,
        tags: {
          create: z.tags.map(t => ({
            tag: {
              connectOrCreate: {
                where: { name: t },
                create: { name: t }
              }
            }
          }))
        },
        contacts: {
          create: z.contacts.map(c => ({ type: c.type as any, value: c.value }))
        }
      }
    });
    createdZones.push(zone);
  }
  console.log(`✅ Created ${zoneData.length} zones`);

  // 5. Create Groups & Messages
  console.log('💬 Creating groups and demo messages...');

  // Group 1: For the Valorant hard rank zone
  const group1 = await prisma.group.create({
    data: {
      zoneId: createdZones[0].id,
      leaderId: users['SonGoku_VN'].id,
      gameId: games['Valorant'].id,
      members: {
        create: [
          { userId: users['SonGoku_VN'].id, role: GroupMemberRole.LEADER },
          { userId: users['Tuan_Fps_God'].id, role: GroupMemberRole.MEMBER },
          { userId: users['TestUser_Seed'].id, role: GroupMemberRole.MEMBER },
        ]
      }
    }
  });

  await prisma.message.createMany({
    data: [
      { groupId: group1.id, senderId: users['SonGoku_VN'].id, content: 'Chào ông, bắn Valorant không?' },
      { groupId: group1.id, senderId: users['Tuan_Fps_God'].id, content: 'Có ông ơi, đợi tôi mở máy tí.' },
      { groupId: group1.id, senderId: users['TestUser_Seed'].id, content: 'Cho tui chơi cùng với nhé!' },
      { groupId: group1.id, senderId: users['SonGoku_VN'].id, content: 'Ok, call Discord nhé SonGoku#1234' },
    ]
  });

  // Group 2: For Genshin Impact chill
  const group2 = await prisma.group.create({
    data: {
      zoneId: createdZones[1].id,
      leaderId: users['Linh_Xinh_Genshin'].id,
      gameId: games['Genshin Impact'].id,
      members: {
        create: [
          { userId: users['Linh_Xinh_Genshin'].id, role: GroupMemberRole.LEADER },
          { userId: users['Huong_Support'].id, role: GroupMemberRole.MEMBER },
          { userId: users['TestUser_Seed'].id, role: GroupMemberRole.MEMBER },
        ]
      }
    }
  });

  await prisma.message.createMany({
    data: [
      { groupId: group2.id, senderId: users['Linh_Xinh_Genshin'].id, content: 'Mọi người rảnh tối nay đi boss tuần không?' },
      { groupId: group2.id, senderId: users['Huong_Support'].id, content: 'Tầm 8h được không ạ? Em vào support cho.' },
      { groupId: group2.id, senderId: users['TestUser_Seed'].id, content: 'Cho tui vào kéo boss cho :v' },
      { groupId: group2.id, senderId: users['Linh_Xinh_Genshin'].id, content: 'Duyệt luôn!' },
    ]
  });

  console.log('✅ Created groups and sample messages');

  // 6. Create Friendships
  console.log('🤝 Creating friendships...');
  await prisma.friendship.createMany({
    data: [
      { senderId: users['SonGoku_VN'].id, receiverId: users['Tuan_Fps_God'].id, status: 'ACCEPTED' },
      { senderId: users['SonGoku_VN'].id, receiverId: users['Linh_Xinh_Genshin'].id, status: 'ACCEPTED' },
      { senderId: users['Huong_Support'].id, receiverId: users['Linh_Xinh_Genshin'].id, status: 'ACCEPTED' },
      { senderId: users['Duy_Solo_Top'].id, receiverId: users['Tuan_Fps_God'].id, status: 'PENDING' },
      { senderId: users['TestUser_Seed'].id, receiverId: users['SonGoku_VN'].id, status: 'ACCEPTED' },
    ]
  });

  // 7. Create User Likes
  console.log('👍 Creating user likes...');
  await prisma.userLike.createMany({
    data: [
      { userId: users['SonGoku_VN'].id, likerId: users['Tuan_Fps_God'].id },
      { userId: users['SonGoku_VN'].id, likerId: users['Linh_Xinh_Genshin'].id },
      { userId: users['SonGoku_VN'].id, likerId: users['Huong_Support'].id },
      { userId: users['Tuan_Fps_God'].id, likerId: users['SonGoku_VN'].id },
      { userId: users['Linh_Xinh_Genshin'].id, likerId: users['Huong_Support'].id },
      { userId: users['TestUser_Seed'].id, likerId: users['SonGoku_VN'].id },
    ]
  });

  // 8. Create Zone Invites
  console.log('📩 Creating zone invites...');
  await prisma.zoneInvite.create({
    data: {
      zoneId: createdZones[0].id, // Valorant hard rank
      inviterId: users['SonGoku_VN'].id,
      inviteeId: users['Huong_Support'].id,
      status: 'PENDING'
    }
  });

  // 9. Create Quick Match Queue
  console.log('⏱️ Creating quick match queue entries...');
  await prisma.quickMatchQueue.create({
    data: {
      userId: users['Duy_Solo_Top'].id,
      gameId: games['League of Legends'].id,
      rankLevel: RankLevel.ADVANCED,
      requiredPlayers: 5
    }
  });

  // 10. Create Sample Reports
  console.log('🚩 Creating sample reports...');
  await prisma.report.createMany({
    data: [
      {
        reporterId: users['SonGoku_VN'].id,
        targetType: 'USER',
        targetId: users['Tuan_Fps_God'].id,
        reason: 'Sử dụng ngôn từ không chuẩn mực trong chat.',
        severity: ReportSeverity.LOW,
      },
      {
        reporterId: users['Linh_Xinh_Genshin'].id,
        targetType: 'ZONE',
        targetId: createdZones[2].id, // CS2
        reason: 'Tiêu đề zone chứa nội dung nhạy cảm.',
        severity: ReportSeverity.MEDIUM,
      },
      {
        reporterId: users['Huong_Support'].id,
        targetType: 'GROUP',
        targetId: group2.id,
        reason: 'Có hành vi phá hoại trải nghiệm người chơi khác.',
        severity: ReportSeverity.HIGH,
      }
    ]
  });

  console.log('\n🚀 SEEDING COMPLETED SUCCESSFULLY!');
  console.log('-----------------------------------');
  console.log('Danh sách tài khoản test (Mật khẩu: User123456):');
  userData.forEach(u => console.log(`- ${u.username}: ${u.email}`));
  console.log('-----------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
