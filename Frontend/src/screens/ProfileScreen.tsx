import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Trash2,
  Gamepad2,
  Heart,
  Trophy,
  MapPin,
  Settings,
  LogOut,
  Zap,
  Users,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Container } from '../components/Container';
import { useAuthStore } from '../store/useAuthStore';
import { theme } from '../theme';
import { Button } from '../components/Button';
import { ThemedDialog } from '../components/ThemedDialog';
import type { ThemedDialogVariant } from '../components/ThemedDialog';
import { STRINGS } from '../constants/strings';
import { apiClient } from '../api/client';
import { UserGameProfile } from '../types';

export const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState<{
    title: string;
    message: string;
    variant: ThemedDialogVariant;
  } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data: gameProfiles, isLoading } = useQuery({
    queryKey: ['user-game-profiles'],
    queryFn: async () => {
      const response = await apiClient.get('/user-game-profiles/me');
      return response.data.data;
    },
  });

  const { data: friendsTotal } = useQuery({
    queryKey: ['friends', 'count'],
    queryFn: async () => {
      const res = await apiClient.get('/friends?limit=1&page=1');
      return res.data.data.meta?.total ?? 0;
    },
    enabled: !!user,
  });

  const { data: mePayload } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: async () => {
      const res = await apiClient.get('/users/me');
      return res.data.data as { likesReceived?: number };
    },
    enabled: !!user,
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/user-game-profiles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-game-profiles'] });
      setNotice({
        title: 'Thành công',
        message: 'Đã xóa hồ sơ game.',
        variant: 'success',
      });
    },
    onError: () => {
      setNotice({
        title: 'Lỗi',
        message: 'Không thể xóa hồ sơ game.',
        variant: 'error',
      });
    },
  });

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  return (
    <Container>
      <ThemedDialog
        visible={notice !== null}
        title={notice?.title ?? ''}
        message={notice?.message ?? ''}
        variant={notice?.variant ?? 'info'}
        primaryLabel="Đóng"
        onPrimary={() => setNotice(null)}
        onBackdrop={() => setNotice(null)}
      />
      <ThemedDialog
        visible={confirmDeleteId !== null}
        title="Xác nhận xóa"
        message="Bạn có chắc muốn xóa hồ sơ game này?"
        variant="info"
        secondaryLabel="Hủy"
        onSecondary={() => setConfirmDeleteId(null)}
        onBackdrop={() => setConfirmDeleteId(null)}
        primaryLabel="Xóa"
        primaryDestructive
        onPrimary={() => {
          if (confirmDeleteId) deleteProfileMutation.mutate(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
      />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>HỒ SƠ</Text>
          <Text style={styles.headerSubtitle}>THÔNG TIN CÁ NHÂN</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('EditProfile' as never)}
        >
          <Settings size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={['rgba(37,99,255,0.15)', 'rgba(124,58,237,0.08)']}
            style={styles.heroCardBg}
          />

          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              {user?.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={styles.avatar}
                  contentFit="cover"
                  transition={500}
                  cachePolicy="disk"
                />
              ) : (
                <View
                  style={[
                    styles.avatarPlaceholder,
                    { backgroundColor: theme.colors.buttonSolidPrimary },
                  ]}
                >
                  <Text style={styles.avatarInitial}>
                    {user?.username?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.onlineBadge} />
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.username}>{user?.username}</Text>
              <View style={styles.roleBadge}>
                <Zap size={10} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.roleText}>
                  {user?.role === 'ADMIN'
                    ? STRINGS.ROLE_ADMIN
                    : STRINGS.ROLE_USER}
                </Text>
              </View>
              <View style={styles.playStyleBadge}>
                <Gamepad2 size={12} color={theme.colors.primary} />
                <Text style={styles.playStyleText}>
                  {user?.profile?.playStyle || STRINGS.PLAYSTYLE_CASUAL}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.bioDivider} />
          <Text style={styles.bioText}>
            {user?.profile?.bio || STRINGS.BIO_PLACEHOLDER}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            {
              icon: Trophy,
              color: theme.colors.primary,
              value: gameProfiles?.length || 0,
              label: 'Games',
            },
            {
              icon: Users,
              color: '#22C55E',
              value: friendsTotal ?? 0,
              label: 'Bạn bè',
            },
            {
              icon: Heart,
              color: '#EF4444',
              value: mePayload?.likesReceived ?? 0,
              label: 'Lượt tim',
            },
          ].map((stat, idx) => (
            <View key={idx} style={styles.statCard}>
              <LinearGradient
                colors={[stat.color + '20', stat.color + '05']}
                style={styles.statIconBg}
              >
                <stat.icon size={20} color={stat.color} />
              </LinearGradient>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Game Profiles Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionAccent} />
            <Gamepad2 size={18} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>GAME ĐÃ CHƠI</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddGameProfile' as never)}
          >
            <Text style={styles.addButton}>+ Thêm Game</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator
            color={theme.colors.primary}
            style={{ marginVertical: 24 }}
          />
        ) : gameProfiles?.length > 0 ? (
          gameProfiles.map((profile: UserGameProfile) => {
            return (
              <View key={profile.id} style={styles.gameProfileCard}>
                <Image
                  source={{ uri: profile.game.iconUrl }}
                  style={styles.gameProfileIcon}
                  contentFit="cover"
                  transition={500}
                  cachePolicy="disk"
                />
                <View style={styles.gameProfileInfo}>
                  <Text style={styles.gameProfileName}>
                    {profile.game.name}
                  </Text>
                  <Text style={styles.gameProfileSub}>Đã thêm vào hồ sơ</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(profile.id)}
                  style={styles.deleteButton}
                >
                  <Trash2 size={16} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Gamepad2
              size={40}
              color={theme.colors.primary}
              style={{ opacity: 0.3 }}
            />
            <Text style={styles.emptyText}>{STRINGS.NO_GAMES_IN_PROFILE}</Text>
            <Button
              title="Thêm Game Ngay"
              onPress={() => navigation.navigate('AddGameProfile' as never)}
              size="sm"
              variant="outline"
            />
          </View>
        )}

        {/* Navigation Actions */}
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.actionBlock}
            onPress={() => navigation.navigate('Friends' as never)}
          >
            <View style={styles.actionIconBg}>
              <Users size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Bạn Bè</Text>
              <Text style={styles.actionSubtitle}>
                Quản lý bạn bè và lời mời
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBlock}
            onPress={() => navigation.navigate('Leaderboard' as never)}
          >
            <View style={styles.actionIconBg}>
              <Trophy size={20} color="#F59E0B" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Bảng Xếp Hạng</Text>
              <Text style={styles.actionSubtitle}>
                Top người dùng yêu thích
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.myZonesButton}
            onPress={() => navigation.navigate('MyZones' as never)}
            activeOpacity={0.92}
          >
            <MapPin size={18} color="#FFF" strokeWidth={2.2} />
            <Text style={styles.myZonesText}>My Zones (Khu vực của tôi)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <LogOut size={16} color={theme.colors.error} />
            <Text style={styles.logoutText}>{STRINGS.LOGOUT}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  settingsButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },

  // Hero Card
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  heroCardBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(37,99,255,0.5)',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(37,99,255,0.4)',
  },
  avatarInitial: {
    fontSize: 32,
    color: '#FFF',
    fontWeight: '900',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    borderWidth: 3,
    borderColor: '#1E293B',
  },
  userInfo: {
    flex: 1,
    gap: 6,
  },
  username: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  playStyleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(37,99,255,0.12)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(37,99,255,0.2)',
  },
  playStyleText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  bioDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionAccent: {
    width: 3,
    height: 16,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  addButton: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },

  // Game Profile Card
  gameProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  gameProfileIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    margin: 12,
  },
  gameProfileInfo: {
    flex: 1,
    gap: 5,
    paddingRight: 8,
  },
  gameProfileName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  gameProfileSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 14,
    margin: 2,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderStyle: 'dashed',
    marginBottom: theme.spacing.lg,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },

  // Footer
  footerActions: {
    gap: 12,
    marginTop: 24,
  },
  myZonesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: theme.colors.buttonSolidAccent,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  myZonesText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  logoutText: {
    color: theme.colors.error,
    fontWeight: '700',
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  actionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(37,99,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});
