import React from 'react';
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
import { Users, ChevronRight } from 'lucide-react-native';
import { Container } from '../components/Container';
import { Header } from '../components/Header';
import { theme } from '../theme';
import { apiClient } from '../api/client';
import { Group } from '../types';

export const GroupsScreen = () => {
  const navigation = useNavigation<any>();

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
      <Image
        source={{ uri: item.game.iconUrl || 'https://via.placeholder.com/150' }}
        style={styles.gameIcon}
        contentFit="cover"
        transition={500}
        cachePolicy="disk"
      />
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

  return (
    <Container>
      <Header title="Đội Của Bạn" />
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
    width: 54,
    height: 54,
    borderRadius: theme.borderRadius.md,
  },
  groupInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'center',
  },
  groupTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  gameName: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 6,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaText: {
    marginLeft: 6,
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  actionContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderCard: {
    backgroundColor: '#162338',
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  placeholderText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});
