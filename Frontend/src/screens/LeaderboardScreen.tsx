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
import { useQuery } from '@tanstack/react-query';
import { Trophy, ArrowLeft, Heart, Medal } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Container } from '../components/Container';
import { theme } from '../theme';
import { apiClient } from '../api/client';
import { LeaderboardUser } from '../types';

const PERIODS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'month', label: 'Tháng' },
    { value: 'week', label: 'Tuần' },
];

export const LeaderboardScreen = () => {
    const navigation = useNavigation<any>();
    const [period, setPeriod] = useState('all');

    const { data: leaderboard, isLoading } = useQuery({
        queryKey: ['leaderboard', period],
        queryFn: async () => {
            const res = await apiClient.get(`/leaderboard/users?period=${period}`);
            return res.data.data as LeaderboardUser[];
        },
    });

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return '#F1C40F'; // Gold
            case 2: return '#BDC3C7'; // Silver
            case 3: return '#CD7F32'; // Bronze
            default: return theme.colors.textMuted;
        }
    };

    const renderItem = ({ item }: { item: LeaderboardUser }) => {
        const isTop3 = item.rank <= 3;
        const rankColor = getRankColor(item.rank);

        return (
            <TouchableOpacity
                style={[styles.userCard, isTop3 && { borderColor: rankColor + '50', borderWidth: 1 }]}
                onPress={() => navigation.navigate('PublicProfile', { userId: item.userId })}
                activeOpacity={0.8}
            >
                <View style={styles.rankContainer}>
                    {isTop3 ? (
                        <Medal size={24} color={rankColor} />
                    ) : (
                        <Text style={styles.rankText}>#{item.rank}</Text>
                    )}
                </View>

                <View style={styles.avatarWrapper}>
                    {item.avatarUrl ? (
                        <Image source={{ uri: item.avatarUrl }} style={styles.avatar} contentFit="cover" transition={300} />
                    ) : (
                        <LinearGradient colors={['#2563FF', '#7C3AED']} style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarInitial}>{item.username.charAt(0).toUpperCase()}</Text>
                        </LinearGradient>
                    )}
                </View>

                <View style={styles.userInfo}>
                    <Text style={styles.username} numberOfLines={1}>{item.username}</Text>
                </View>

                <View style={styles.likeContainer}>
                    <Heart size={16} color="#EF4444" fill="#EF4444" />
                    <Text style={styles.likeCount}>{item.likeCount}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Container>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Trophy color="#F1C40F" size={24} />
                <Text style={styles.title}>BẢNG XẾP HẠNG</Text>
                <View style={{ width: 42 }} />
            </View>

            <View style={styles.filterContainer}>
                {PERIODS.map(p => (
                    <TouchableOpacity
                        key={p.value}
                        style={[styles.filterBtn, period === p.value && styles.filterBtnActive]}
                        onPress={() => setPeriod(p.value)}
                    >
                        <Text style={[styles.filterBtnText, period === p.value && styles.filterBtnTextActive]}>
                            {p.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {isLoading ? (
                <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={leaderboard}
                    keyExtractor={item => item.userId}
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
    filterContainer: {
        flexDirection: 'row',
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 4,
    },
    filterBtn: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    filterBtnActive: {
        backgroundColor: 'rgba(37,99,255,0.2)',
    },
    filterBtnText: {
        color: theme.colors.textMuted,
        fontWeight: '600',
    },
    filterBtnTextActive: {
        color: theme.colors.primary,
    },
    listContent: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: 40,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 12,
        borderRadius: 16,
        marginBottom: 10,
    },
    rankContainer: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankText: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.colors.textMuted,
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
    likeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(239,68,68,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    likeCount: {
        color: '#EF4444',
        fontWeight: 'bold',
    },
    emptyText: {
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginTop: 40,
    },
});
