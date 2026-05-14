import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Users, ChevronRight, Gamepad2 } from 'lucide-react-native';
import { Container } from '../components/Container';
import { Header } from '../components/Header';
import { theme } from '../theme';
import { apiClient } from '../api/client';
import { Group } from '../types';
import { MyZonesScreen } from './MyZonesScreen';

type TabKey = 'groups' | 'zones';

export const GroupsScreen = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<TabKey>('groups');

  const {
    data: groups,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['my_groups'],
    queryFn: async () => {
      const response = await apiClient.get('/groups');
      // Backend wraps all responses in { data: [...], success: true }
      const raw = response.data;
      if (Array.isArray(raw)) return raw as Group[];
      if (Array.isArray(raw?.data)) return raw.data as Group[];
      return [] as Group[];
    },
  });

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const renderGroupItem = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={styles.groupCard}
      activeOpacity={0.7}
      onPress={() =>
        navigation.navigate('ChatRoom', {
          groupId: item.id,
          groupName: item.zone.title,
        })
      }
    >
      <View style={[styles.gameIcon, styles.gameIconPlaceholder]}>
        <Gamepad2 size={22} color="#2563EB" />
        <Image
          source={{ uri: item.game.iconUrl || 'https://via.placeholder.com/150' }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={500}
          cachePolicy="disk"
        />
      </View>
      <View style={styles.groupInfo}>
        <Text style={styles.groupTitle} numberOfLines={1}>
          {item.zone.title}
        </Text>
        <Text style={styles.gameName}>{item.game.name}</Text>
        <View style={styles.metaContainer}>
          <View style={styles.metaBadge}>
            <Users size={14} color={theme.colors.textSecondary} />
            <Text style={styles.metaText}>
              {item._count?.members || 1} Thành viên
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.actionContainer}>
        <ChevronRight size={20} color={theme.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tabItem, activeTab === 'groups' && styles.tabItemActive]}
        onPress={() => setActiveTab('groups')}
        activeOpacity={0.7}
      >
        <Users
          size={16}
          color={activeTab === 'groups' ? '#FFF' : theme.colors.textSecondary}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'groups' && styles.tabLabelActive,
          ]}
        >
          Đội của tôi
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabItem, activeTab === 'zones' && styles.tabItemActive]}
        onPress={() => setActiveTab('zones')}
        activeOpacity={0.7}
      >
        <Gamepad2
          size={16}
          color={activeTab === 'zones' ? '#FFF' : theme.colors.textSecondary}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'zones' && styles.tabLabelActive,
          ]}
        >
          Phòng chờ
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderGroupsTab = () => (
    <>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : groups && groups.length > 0 ? (
        <>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTitle}>Nhóm đã tham gia</Text>
            <Text style={styles.summaryValue}>{groups.length}</Text>
          </View>
          <FlatList
            data={groups}
            keyExtractor={item => item.id}
            renderItem={renderGroupItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <View style={styles.center}>
          <View style={styles.placeholderCard}>
            <Users
              size={48}
              color={theme.colors.textSecondary}
              style={{ marginBottom: theme.spacing.md }}
            />
            <Text style={styles.placeholderText}>
              Bạn chưa tham gia đội nào.
            </Text>
            <Text
              style={[styles.placeholderText, { fontSize: 14, marginTop: 8 }]}
            >
              Hãy tham gia một khu vực (Zone) để kết nối với những người chơi
              khác!
            </Text>
          </View>
        </View>
      )}
    </>
  );

  return (
    <Container>
      <Header title={activeTab === 'groups' ? 'Đội Của Bạn' : 'Phòng Chờ'} />
      {renderTabBar()}
      {activeTab === 'groups'
        ? renderGroupsTab()
        : <MyZonesScreen embedded />}
    </Container>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    padding: theme.spacing.xxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  summaryRow: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryTitle: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '800',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  groupCard: {
    flexDirection: 'row',
    backgroundColor: '#162338',
    padding: theme.spacing.md,
    borderRadius: 16,
    marginTop: theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  gameIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  gameIconPlaceholder: {
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  groupTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  gameName: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metaText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  actionContainer: {
    marginLeft: 8,
  },
  placeholderCard: {
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },

  // ─── Tab Bar ──────────────────────────────
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.md,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 11,
  },
  tabItemActive: {
    backgroundColor: '#2563FF',
    shadowColor: '#2563FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabLabelActive: {
    color: '#FFF',
    fontWeight: '700',
  },
});
