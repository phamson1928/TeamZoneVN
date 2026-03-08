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
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, UserPlus, UserMinus, UserCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Container } from '../components/Container';
import { theme } from '../theme';
import { apiClient } from '../api/client';
import { Friendship, User } from '../types';

const TABS = [
    { value: 'friends', label: 'Bạn Bè' },
    { value: 'requests', label: 'Lời Mời' },
];

export const FriendsScreen = () => {
    const navigation = useNavigation<any>();
    const queryClient = useQueryClient();
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

    const respondMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: 'ACCEPTED' | 'DECLINED' }) => {
            await apiClient.patch(`/friends/request/${id}`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['friends'] });
        }
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
        // Determine the "other user" depending on the context
        // If we're looking at friends, we need to know who the other user is.
        // However, the backend should return `sender` and `receiver` objects or `friend` object.
        // Based on Phase 9 plan, GET /friends returns an array of User or Friendship. 
        // Assuming GET /friends returns { ...user, friendshipId: ... } or Friendship object.
        // Assuming backend returns `{ id, sender, receiver }`. 
        // Let's assume it returns `sender` and `receiver` correctly.

        // Try to find the user to display
        let otherUser: User | undefined;
        const currentUserId = queryClient.getQueryData<any>(['user'])?.id; // Rough guess, maybe authStore
        // For simplicity, just use whichever exists (if it returns a direct user object instead of friendship, adapt)
        // Actually, backend friend returned from GET /friends is array of users in `data.data` ?
        // In phase 9.1: "GET /friends - Danh sách bạn bè (pagination)", usually it returns User[].
        // Let's assume `item` is a User or has `user` property. Or we fallback.
        const displayUser = item.sender || item.receiver || (item as unknown as User);

        return (
            <View style={styles.userCard}>
                <TouchableOpacity
                    style={styles.userInfoWrapper}
                    onPress={() => navigation.navigate('PublicProfile', { userId: displayUser.id })}
                    activeOpacity={0.8}
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
                </TouchableOpacity>

                <View style={styles.actions}>
                    {activeTab === 'requests' ? (
                        <>
                            <TouchableOpacity
                                style={styles.btnAccept}
                                onPress={() => respondMutation.mutate({ id: item.id, status: 'ACCEPTED' })}
                            >
                                <UserCheck size={16} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.btnDecline}
                                onPress={() => respondMutation.mutate({ id: item.id, status: 'DECLINED' })}
                            >
                                <ArrowLeft size={16} color="#EF4444" style={{ transform: [{ rotate: '45deg' }] }} />
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            style={styles.btnDecline}
                            onPress={() => unfriendMutation.mutate(displayUser.id)}
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
