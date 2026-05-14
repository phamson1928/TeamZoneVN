import React, { useCallback, useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Modal,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Plus,
  Users,
  Trophy,
  Clock,
  Gamepad2,
  ChevronRight,
  MoreVertical,
  Eye,
  Calendar,
  Zap,
  Trash2,
  X,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { apiClient } from '../api/client';
import { theme } from '../theme';
import { Zone } from '../types';
import { RootStackParamList } from '../navigation';
import { ScaleInView } from '../components/AnimatedTransition';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'OPEN':
      return {
        color: '#22C55E',
        bg: 'rgba(34,197,94,0.12)',
        label: 'OPEN',
        icon: '🟢',
      };
    case 'FULL':
      return {
        color: '#F59E0B',
        bg: 'rgba(245,158,11,0.12)',
        label: 'FULL',
        icon: '🟡',
      };
    default:
      return {
        color: '#64748B',
        bg: 'rgba(100,116,139,0.12)',
        label: 'UNKNOWN',
        icon: '⚪',
      };
  }
};

const AnimatedStatusDot = ({ status }: { status: string }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const config = getStatusConfig(status);

  useEffect(() => {
    if (status === 'OPEN') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [status, pulseAnim]);

  return (
    <View style={styles.statusDotContainer}>
      {status === 'OPEN' && (
        <Animated.View
          style={[
            styles.statusDotPulse,
            {
              backgroundColor: config.color,
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.3],
                outputRange: [0.5, 0],
              }),
            },
          ]}
        />
      )}
      <View style={[styles.statusDotCore, { backgroundColor: config.color }]} />
    </View>
  );
};

export const MyZonesScreen = ({ embedded = false }: { embedded?: boolean }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const [actionSheetZone, setActionSheetZone] = useState<Zone | null>(null);
  const [deleteZoneId, setDeleteZoneId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!embedded) {
        StatusBar.setBarStyle('dark-content');
        StatusBar.setBackgroundColor('transparent');
        StatusBar.setTranslucent(true);
      }
    }, [embedded]),
  );

  const {
    data: allZones = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['my-zones'],
    queryFn: async () => {
      const response = await apiClient.get('/zones/my');
      return response.data.data as Zone[];
    },
  });

  // "Phòng chờ" (embedded) chỉ hiện zone chưa FULL
  const zones = embedded ? allZones.filter(z => z.status !== 'FULL') : allZones;

  const deleteMutation = useMutation({
    mutationFn: async (zoneId: string) => {
      await apiClient.delete(`/zones/${zoneId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-zones'] });
      Alert.alert('Thành công', 'Đã xóa phòng');
    },
    onError: () => {
      Alert.alert('Lỗi', 'Không thể xóa phòng');
    },
  });

  const handleDelete = (zoneId: string) => {
    setDeleteZoneId(zoneId);
  };

  const handleEdit = (zone: Zone) => {
    navigation.navigate('CreateZone', { zoneId: zone.id });
  };

  const handleOptions = (zone: Zone) => {
    setActionSheetZone(zone);
  };

  const renderZoneItem = ({ item, index }: { item: Zone; index: number }) => {
    const statusConfig = getStatusConfig(item.status);
    const requests = item.joinRequests || [];
    const pendingCount = requests.filter(
      (r: any) => r.status === 'PENDING',
    ).length;
    const approvedCount = requests.filter(
      (r: any) => r.status === 'APPROVED',
    ).length;
    const groupMembers = item.group?._count?.members ?? 0;
    const currentPlayers = groupMembers > 0 ? groupMembers : (approvedCount + 1);
    const tagCount = item.tags?.length ?? 0;

    if (embedded) {
      return (
        <ScaleInView>
          <View style={styles.embeddedCard}>
          {/* Row 1: Game icon + title + 3-dot */}
          <View style={styles.embeddedCardHeader}>
            <TouchableOpacity
              style={styles.embeddedCardHeaderLeft}
              onPress={() =>
                navigation.navigate('ZoneDetails', { zoneId: item.id })
              }
              activeOpacity={0.7}
            >
              {item.game?.iconUrl ? (
                <View style={[styles.embeddedGameIcon, styles.gameIconPlaceholderEmbed]}>
                  <Gamepad2 size={18} color="#2563EB" />
                  <Image
                    source={{ uri: item.game.iconUrl }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    transition={300}
                    cachePolicy="disk"
                  />
                </View>
              ) : (
                <View style={[styles.embeddedGameIcon, styles.gameIconPlaceholderEmbed]}>
                  <Gamepad2 size={18} color="#2563EB" />
                </View>
              )}
              <View style={styles.embeddedTitleArea}>
                <Text style={styles.embeddedTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.embeddedGameName} numberOfLines={1}>
                  {item.game?.name || 'Unknown'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.embeddedOptionsBtn}
              onPress={() => handleOptions(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MoreVertical size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Row 2: Badge + meta + status */}
          <View style={styles.embeddedCardMeta}>
            <View style={[styles.embeddedBadge, { backgroundColor: statusConfig.bg }]}>
              <View style={[styles.embeddedBadgeDot, { backgroundColor: statusConfig.color }]} />
              <Text style={[styles.embeddedBadgeLabel, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>

            <View style={styles.embeddedMetaItem}>
              <Users size={14} color="#64748B" />
              <Text style={styles.embeddedMetaText}>
                {currentPlayers}/{item.requiredPlayers + 1}
              </Text>
            </View>

            <View style={styles.embeddedMetaItem}>
              <Clock size={14} color="#64748B" />
              <Text style={styles.embeddedMetaText}>
                {new Date(item.createdAt).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          </View>

          {/* Row 3: Pending alert (if any) */}
          {pendingCount > 0 && (
            <View style={styles.embeddedPendingRow}>
              <Zap size={14} color="#F59E0B" />
              <Text style={styles.embeddedPendingText}>
                {pendingCount} yêu cầu đang chờ
              </Text>
            </View>
          )}
          </View>
        </ScaleInView>
      );
    }

    return (
      <ScaleInView>
        <View style={styles.timelineItem}>
        {/* Timeline Line */}
        {index !== zones.length - 1 && <View style={styles.timelineLine} />}

        {/* Timeline Node */}
        <View style={styles.timelineNode}>
          <View
            style={[
              styles.timelineNodeOuter,
              { borderColor: statusConfig.color },
            ]}
          >
            <AnimatedStatusDot status={item.status} />
          </View>
        </View>

        {/* Content Card */}
        <View style={styles.contentCard}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('ZoneDetails', { zoneId: item.id })
            }
          >
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.gameSection}>
              {item.game?.iconUrl ? (
                <View style={[styles.gameIconWrapper, styles.gameIconPlaceholder]}>
                  <Gamepad2 size={20} color="#2563EB" />
                  <Image
                    source={{ uri: item.game.iconUrl }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    transition={500}
                    cachePolicy="disk"
                  />
                </View>
              ) : (
                <View style={[styles.gameIconWrapper, styles.gameIconPlaceholder]}>
                  <Gamepad2 size={20} color="#2563EB" />
                </View>
              )}
                <View style={styles.gameInfo}>
                  <Text style={styles.gameLabel}>Game</Text>
                  <Text style={styles.gameName} numberOfLines={1}>
                    {item.game?.name || 'Unknown'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Status Badge */}
            <View
              style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
            >
              <Text style={styles.statusEmoji}>{statusConfig.icon}</Text>
              <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>

            {/* Title */}
            <Text style={styles.zoneTitle} numberOfLines={2}>
              {item.title}
            </Text>

            {/* Info Grid */}
            <View style={styles.infoGrid}>
              {/* Players */}
              <View style={styles.infoItem}>
                <View style={styles.infoIconBg}>
                  <Users size={16} color="#2563EB" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Người chơi</Text>
                  <Text style={styles.infoValue}>
                    {currentPlayers}/{item.requiredPlayers + 1}
                  </Text>
                </View>
              </View>

              {/* Tags */}
              <View style={styles.infoItem}>
                <View
                  style={[
                    styles.infoIconBg,
                    { backgroundColor: 'rgba(245,158,11,0.15)' },
                  ]}
                >
                  <Trophy size={16} color="#F59E0B" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Tags</Text>
                  <Text style={styles.infoValue}>
                    {tagCount > 0 ? `${tagCount} thẻ` : 'Chưa có'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Pending Requests Alert */}
            {pendingCount > 0 && (
              <View style={styles.pendingAlert}>
                <View style={styles.pendingAlertLeft}>
                  <View style={styles.pendingIcon}>
                    <Clock size={16} color="#F59E0B" />
                  </View>
                  <Text style={styles.pendingText}>
                    <Text style={styles.pendingCount}>{pendingCount}</Text> yêu
                    cầu đang chờ duyệt
                  </Text>
                </View>
                <Zap size={16} color="#F59E0B" />
              </View>
            )}

            {/* Footer */}
            <View style={styles.cardFooter}>
              <View style={styles.dateInfo}>
                <Calendar size={14} color="#94A3B8" />
                <Text style={styles.dateText}>
                  {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                </Text>
              </View>

              <View style={styles.viewButton}>
                <Eye size={16} color="#2563EB" />
                <Text style={styles.viewButtonText}>Xem chi tiết</Text>
                <ChevronRight size={16} color="#2563EB" />
              </View>
            </View>
          </TouchableOpacity>

          {/* 3-dot button - OUTSIDE the navigation touchable */}
          <TouchableOpacity
            style={styles.optionsButtonAbsolute}
            onPress={() => handleOptions(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MoreVertical size={20} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>
        </ScaleInView>
    );
  };

  const renderHeader = () => (<View style={[styles.header, { paddingTop: insets.top + 16 }]}>
      <View style={styles.headerContent}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft color={theme.colors.text} size={24} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Quản lý phòng</Text>
          <Text style={styles.headerSubtitle}>
            {zones.length} phòng đang hoạt động
          </Text>
        </View>
      </View>
    </View>
  );

  const renderDeleteModal = () => (
    <Modal
      visible={!!deleteZoneId}
      transparent
      animationType="fade"
      onRequestClose={() => setDeleteZoneId(null)}
    >
      <Pressable
        style={styles.deleteOverlay}
        onPress={() => setDeleteZoneId(null)}
      >
        <Pressable style={styles.deleteCard} onPress={(e) => e.stopPropagation()}>
          <View style={styles.deleteIconCircle}>
            <Trash2 size={28} color="#EF4444" />
          </View>
          <Text style={styles.deleteTitle}>Xóa phòng</Text>
          <Text style={styles.deleteMessage}>
            Bạn có chắc chắn muốn xóa phòng này không? Hành động này không thể
            hoàn tác.
          </Text>
          <View style={styles.deleteActions}>
            <TouchableOpacity
              style={styles.deleteCancelBtn}
              onPress={() => setDeleteZoneId(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteCancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteConfirmBtn}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  if (deleteZoneId) deleteMutation.mutate(deleteZoneId);
                  setDeleteZoneId(null);
              }}
              disabled={deleteMutation.isPending}
              activeOpacity={0.85}
            >
              <Text style={styles.deleteConfirmText}>
                {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );

  const selectedZone = actionSheetZone;

  const renderActionSheet = () => (
    <Modal
      visible={!!actionSheetZone}
      transparent
      animationType="fade"
      onRequestClose={() => setActionSheetZone(null)}
    >
      <Pressable
        style={styles.actionSheetOverlay}
        onPress={() => setActionSheetZone(null)}
      >
        <Pressable style={styles.actionSheetCard} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.actionSheetTitle} numberOfLines={1}>
            {selectedZone?.title || 'Phòng'}
          </Text>
          <View style={styles.actionSheetDivider} />

          <TouchableOpacity
            style={styles.actionSheetOption}
            onPress={() => {
              if (selectedZone) navigation.navigate('ZoneDetails', { zoneId: selectedZone.id });
              setActionSheetZone(null);
            }}
            activeOpacity={0.6}
          >
            <Eye size={18} color="#94A3B8" />
            <Text style={styles.actionSheetOptionText}>Xem chi tiết</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionSheetOption}
            onPress={() => {
              setActionSheetZone(null);
              setTimeout(() => {
                if (selectedZone) handleEdit(selectedZone);
              }, 200);
            }}
            activeOpacity={0.6}
          >
            <Calendar size={18} color="#94A3B8" />
            <Text style={styles.actionSheetOptionText}>Chỉnh sửa</Text>
          </TouchableOpacity>

          <View style={styles.actionSheetDivider} />

          <TouchableOpacity
            style={styles.actionSheetOption}
            onPress={() => {
              const zoneId = selectedZone?.id;
              setActionSheetZone(null);
              if (zoneId) setTimeout(() => handleDelete(zoneId), 200);
            }}
            activeOpacity={0.6}
          >
            <Trash2 size={18} color="#EF4444" />
            <Text style={[styles.actionSheetOptionText, { color: '#EF4444' }]}>Xóa phòng</Text>
          </TouchableOpacity>

          <View style={styles.actionSheetDivider} />

          <TouchableOpacity
            style={styles.actionSheetOption}
            onPress={() => setActionSheetZone(null)}
            activeOpacity={0.6}
          >
            <X size={18} color="#64748B" />
            <Text style={[styles.actionSheetOptionText, { color: '#64748B' }]}>Hủy</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );

  return (
    <View style={embedded ? styles.embeddedContainer : styles.container}>
      {!embedded && renderHeader()}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : zones.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIllustration}>
            <View style={styles.emptyCircle1} />
            <View style={styles.emptyCircle2} />
            <Gamepad2 size={64} color="#2563EB" strokeWidth={1.5} />
          </View>

          <Text style={styles.emptyTitle}>Chưa có phòng nào</Text>
          <Text style={styles.emptyText}>
            Hãy tạo phòng đầu tiên để bắt đầu tìm kiếm đồng đội cùng chơi game
            nhé!
          </Text>

          <TouchableOpacity
            style={styles.emptyCreateButton}
            onPress={() => navigation.navigate('CreateZone')}
            activeOpacity={0.8}
          >
            <Plus color="#FFFFFF" size={20} strokeWidth={2.5} />
            <Text style={styles.emptyCreateButtonText}>Tạo phòng đầu tiên</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={zones}
          renderItem={renderZoneItem}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor="#2563EB"
              colors={['#2563EB']}
            />
          }
        />
      )}

      {/* Floating Action Button */}
      {!isLoading && zones.length > 0 && !embedded && (
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + 24 }]}
          onPress={() => navigation.navigate('CreateZone')}
          activeOpacity={0.85}
        >
          <View style={styles.fabGradient}>
            <Plus color="#FFFFFF" size={28} strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      )}

      {renderActionSheet()}
      {renderDeleteModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  embeddedContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },

  // Timeline Layout
  listContent: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 28,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 19,
    top: 40,
    bottom: -28,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  timelineNode: {
    marginRight: 16,
    paddingTop: 8,
  },
  timelineNodeOuter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  statusDotContainer: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDotPulse: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  statusDotCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // Embedded Card (inside GroupsScreen tab)
  embeddedCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  embeddedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  embeddedCardHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  embeddedGameIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    overflow: 'hidden',
  },
  gameIconPlaceholderEmbed: {
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  embeddedTitleArea: {
    flex: 1,
  },
  embeddedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  embeddedGameName: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 2,
  },
  embeddedOptionsBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  embeddedCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  embeddedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  embeddedBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  embeddedBadgeLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  embeddedMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  embeddedMetaText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  embeddedPendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  embeddedPendingText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
  },

  // Content Card
  contentCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  gameIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  gameIcon: {
    width: '100%',
    height: '100%',
  },
  gameIconPlaceholder: {
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameInfo: {
    flex: 1,
  },
  gameLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  gameName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  optionsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsButtonAbsolute: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
    marginBottom: 12,
  },
  statusEmoji: {
    fontSize: 14,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  zoneTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },

  // Info Grid
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  infoIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(37,99,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },

  // Pending Alert
  pendingAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  pendingAlertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  pendingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(245,158,11,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingText: {
    fontSize: 13,
    color: '#F59E0B',
    fontWeight: '500',
    flex: 1,
  },
  pendingCount: {
    fontWeight: '800',
    color: '#F59E0B',
  },

  // Footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(37,99,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(37,99,255,0.2)',
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIllustration: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  emptyCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(37,99,255,0.08)',
  },
  emptyCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(37,99,255,0.12)',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 280,
  },
  emptyCreateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyCreateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ─── Action Sheet ──────────────────────────
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  actionSheetCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  actionSheetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionSheetDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: 12,
  },
  actionSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  actionSheetOptionText: {
    fontSize: 15,
    color: '#FFF',
    fontWeight: '500',
  },

  // ─── Delete Modal ─────────────────────────
  deleteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  deleteCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  deleteIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239,68,68,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  deleteTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 10,
  },
  deleteMessage: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  deleteCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#94A3B8',
  },
  deleteConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  deleteConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});
