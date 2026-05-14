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
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Send } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Container } from '../components/Container';
import { useAlert } from '../components/AlertProvider';
import { theme } from '../theme';
import { apiClient } from '../api/client';
import { Friendship, User } from '../types';
import { useAuthStore } from '../store/useAuthStore';

function sameUserId(a?: string | null, b?: string | null): boolean {
    if (a == null || b == null) return false;
    return a === b || a.toLowerCase() === b.toLowerCase();
}

export const InviteFriendsScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { zoneId } = route.params as { zoneId: string };
    const currentUserId = useAuthStore(state => state.user?.id);

    const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
    const { showAlert } = useAlert();

    const { data: friendsData, isLoading } = useQuery({
        queryKey: ['friends', 'accepted'],
        queryFn: async () => {
            const res = await apiClient.get('/friends');
            return res.data.data.data as Friendship[];
        },
    });

    const inviteMutation = useMutation({
        mutationFn: async (friendId: string) => {
            await apiClient.post(`/zones/${zoneId}/invite`, { userId: friendId });
        },
        onSuccess: (_, friendId) => {
            setInvitedIds(prev => {
                const next = new Set(prev);
                next.add(friendId);
                return next;
            });
        },
        onError: (err: any) => {
            showAlert({ title: 'Lỗi', message: err.response?.data?.message || 'Không thể mời', variant: 'error' });
        }
    });

    const handleInvite = (friendId: string) => {
        inviteMutation.mutate(friendId);
    };

    const listData = friendsData || [];

    const renderItem = ({ item }: { item: Friendship }) => {
        const peerUserId = sameUserId(currentUserId, item.senderId)
            ? item.receiverId
            : item.senderId;
        const peer =
            sameUserId(currentUserId, item.senderId) ? item.receiver : item.sender;
        const displayUser: User =
            peer ??
            ({
                id: peerUserId,
                username: 'Người dùng',
                avatarUrl: null,
            } as User);

        if (!peerUserId) return null;

        const isInvited = invitedIds.has(peerUserId);
        const isInviting = inviteMutation.variables === peerUserId && inviteMutation.isPending;

        return (
            <View style={styles.userCard}>
                <View style={styles.userInfoWrapper}>
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
                </View>

                <TouchableOpacity
                    style={[styles.btnInvite, isInvited && styles.btnInvited]}
                    onPress={() => handleInvite(peerUserId)}
                    disabled={isInvited || isInviting}
                >
                    {isInviting ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : isInvited ? (
                        <Text style={styles.btnInvitedText}>Đã Mời</Text>
                    ) : (
                        <>
                            <Send size={14} color="#fff" />
                            <Text style={styles.btnInviteText}>Mời</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <Container>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>MỜI BẠN BÈ</Text>
                <View style={{ width: 42 }} />
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
                        <Text style={styles.emptyText}>Chưa có bạn bè nào</Text>
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
        paddingBottom: theme.spacing.md,
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
    btnInvite: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: theme.colors.primary,
    },
    btnInvited: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    btnInviteText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
    },
    btnInvitedText: {
        color: theme.colors.textSecondary,
        fontWeight: 'bold',
        fontSize: 13,
    },
    emptyText: {
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginTop: 40,
    },
});
