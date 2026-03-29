import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, UserMinus, UserCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Container } from '../components/Container';
import { theme } from '../theme';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { Friendship, User } from '../types';

const TABS = [
    { value: 'friends', label: 'Bạn Bè' },
    { value: 'requests', label: 'Lời Mời' },
];

/** JWT / Prisma đôi khi khác chữ hoa thường — so khớp an toàn */
function sameUserId(a?: string | null, b?: string | null): boolean {
    if (a == null || b == null) return false;
    return a === b || a.toLowerCase() === b.toLowerCase();
}

export const FriendsScreen = () => {
    const navigation = useNavigation<any>();
    const queryClient = useQueryClient();
    const currentUserId = useAuthStore(state => state.user?.id);
    const [activeTab, setActiveTab] = useState('friends');

    const { data: friendsData, isLoading: isLoadingFriends } = useQuery({
        queryKey: ['friends', activeTab],
        queryFn: async () => {
            if (activeTab === 'friends') {
                const res = await apiClient.get('/friends');
                return res.data.data.data as Friendship[];
            } else {
                const res = await apiClient.get('/friends/requests');
                return res.data.data as Friendship[];
            }
        },
    });

    const acceptMutation = useMutation({
        mutationFn: async (friendshipId: string) => {
            await apiClient.patch(`/friends/request/${friendshipId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['friends'] });
        },
    });

    /** Từ chối = xóa quan hệ PENDING (DELETE /friends/:senderId) */
    const rejectMutation = useMutation({
        mutationFn: async (senderId: string) => {
            await apiClient.delete(`/friends/${senderId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['friends'] });
        },
    });

    const unfriendMutation = useMutation({
        mutationFn: async (userId: string) => {
            await apiClient.delete(`/friends/${userId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['friends'] });
        }
    });

    const isLoading = isLoadingFriends;
    const listData = friendsData || [];

    const renderItem = ({ item }: { item: Friendship }) => {
        /** Luôn lấy id từ khóa ngoại — tránh lệch khi object sender/receiver thiếu hoặc lỗi serialize */
        const peerUserId =
            activeTab === 'requests'
                ? item.senderId
                : sameUserId(currentUserId, item.senderId)
                  ? item.receiverId
                  : item.senderId;

        const peer =
            activeTab === 'requests'
                ? item.sender
                : sameUserId(currentUserId, item.senderId)
                  ? item.receiver
                  : item.sender;

        if (!peerUserId) {
            return null;
        }

        const displayUser: User = peer ?? {
            id: peerUserId,
            username: 'Người dùng',
            avatarUrl: null,
        };

        return (
            <View style={styles.userCard}>
                <Pressable
                    style={({ pressed }) => [styles.userInfoWrapper, pressed && { opacity: 0.75 }]}
                    onPress={() => navigation.navigate('PublicProfile', { userId: peerUserId })}
                    android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
                >
                    <View style={styles.avatarWrapper}>
                        {displayUser.avatarUrl ? (
                            <Image source={{ uri: displayUser.avatarUrl }} style={styles.avatar} contentFit="cover" transition={300} />
                        ) : (
                            <LinearGradient colors={['#2563FF', '#7C3AED']} style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarInitial}>{displayUser.username?.charAt(0).toUpperCase()}</Text>
                            </LinearGradient>
                        )}
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.username} numberOfLines={1}>{displayUser.username}</Text>
                    </View>
                </Pressable>

                <View style={styles.actions}>
                    {activeTab === 'requests' ? (
                        <>
                            <TouchableOpacity
                                style={styles.btnAccept}
                                onPress={() => acceptMutation.mutate(item.id)}
                            >
                                <UserCheck size={16} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.btnDecline}
                                onPress={() => item.senderId && rejectMutation.mutate(item.senderId)}
                            >
                                <ArrowLeft size={16} color="#EF4444" style={{ transform: [{ rotate: '45deg' }] }} />
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            style={styles.btnDecline}
                            onPress={() => unfriendMutation.mutate(peerUserId)}
                        >
                            <UserMinus size={16} color="#EF4444" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <Container>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>BẠN BÈ</Text>
                <View style={{ width: 42 }} />
            </View>

            <View style={styles.tabs}>
                {TABS.map(t => (
                    <TouchableOpacity
                        key={t.value}
                        style={[styles.tabBtn, activeTab === t.value && styles.tabBtnActive]}
                        onPress={() => setActiveTab(t.value)}
                    >
                        <Text style={[styles.tabText, activeTab === t.value && styles.tabTextActive]}>{t.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {isLoading ? (
                <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={listData}
                    keyExtractor={(item: any) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
                    }
                />
            )}
        </Container>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        gap: 12,
    },
    title: {
        flex: 1,
        fontSize: 20,
        fontWeight: '900',
        color: theme.colors.text,
        letterSpacing: 1,
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
    },
    tabs: {
        flexDirection: 'row',
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 4,
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabBtnActive: {
        backgroundColor: 'rgba(37,99,255,0.2)',
    },
    tabText: {
        color: theme.colors.textMuted,
        fontWeight: '600',
    },
    tabTextActive: {
        color: theme.colors.primary,
    },
    listContent: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: 40,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1E293B',
        padding: 12,
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    userInfoWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarWrapper: {
        width: 46,
        height: 46,
        marginRight: 12,
        borderRadius: 23,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    btnAccept: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnDecline: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(239,68,68,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.3)',
    },
    emptyText: {
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginTop: 40,
    },
});
