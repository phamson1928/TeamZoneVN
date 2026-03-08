import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Zap, ArrowLeft, Gamepad2, Users, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

import { Container } from '../components/Container';
import { theme } from '../theme';
import { apiClient } from '../api/client';
import { QuickMatchStatus } from '../types';

export const QuickMatchScreen = () => {
    const navigation = useNavigation<any>();
    const queryClient = useQueryClient();

    // For simplicity, we just use a predefined setup or fetch user's game profiles to select from.
    const { data: gameProfiles, isLoading: isLoadingProfiles } = useQuery({
        queryKey: ['user-game-profiles'],
        queryFn: async () => {
            const res = await apiClient.get('/user-game-profiles/me');
            return res.data.data;
        },
    });

    const { data: status, isLoading: isLoadingStatus, refetch: refetchStatus } = useQuery<QuickMatchStatus>({
        queryKey: ['quick-match-status'],
        queryFn: async () => {
            const res = await apiClient.get('/quick-match/status');
            return res.data.data as QuickMatchStatus;
        },
        refetchInterval: (query: any) => (query.state.data?.inQueue ? 5000 : false)
    });

    const [selectedGameProfileId, setSelectedGameProfileId] = useState<string | null>(null);

    const startMatchMutation = useMutation({
        mutationFn: async (profileId: string) => {
            const profile = gameProfiles.find((p: any) => p.id === profileId);
            if (!profile) throw new Error('Profile not found');

            await apiClient.post('/quick-match', {
                gameId: profile.gameId,
                rankLevel: profile.rankLevel,
                requiredPlayers: 5, // Default squad size
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quick-match-status'] });
        },
        onError: (err: any) => {
            Alert.alert('Lỗi', err.response?.data?.message || err.message);
        }
    });

    const cancelMatchMutation = useMutation({
        mutationFn: async () => {
            await apiClient.delete('/quick-match');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quick-match-status'] });
        }
    });

    const getElapsedTime = (since?: string) => {
        if (!since) return '00:00';
        const seconds = Math.floor((new Date().getTime() - new Date(since).getTime()) / 1000);
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const [elapsed, setElapsed] = useState('00:00');

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (status?.inQueue && status.queuedSince) {
            interval = setInterval(() => {
                setElapsed(getElapsedTime(status.queuedSince));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status]);

    return (
        <Container>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>GHÉP ĐỘI NHANH</Text>
                <Zap color="#F59E0B" size={24} fill="#F59E0B" />
            </View>

            <View style={styles.content}>
                {(isLoadingProfiles || isLoadingStatus) ? (
                    <ActivityIndicator color={theme.colors.primary} size="large" style={{ marginTop: 100 }} />
                ) : status?.inQueue ? (
                    <View style={styles.queueContainer}>
                        <View style={styles.radarEffect}>
                            <Zap size={64} color={theme.colors.primary} fill={theme.colors.primary} />
                        </View>
                        <Text style={styles.queueTitle}>Đang tìm kiếm trận...</Text>
                        <Text style={styles.queueGame}>{status.gameName}</Text>
                        <Text style={styles.timerText}>{elapsed}</Text>

                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => cancelMatchMutation.mutate()}
                        >
                            <Text style={styles.cancelBtnText}>Hủy ghép đội</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.setupContainer}>
                        <Text style={styles.sectionTitle}>1. Chọn Game</Text>
                        {gameProfiles?.length > 0 ? (
                            <View style={styles.gamesList}>
                                {gameProfiles.map((p: any) => (
                                    <TouchableOpacity
                                        key={p.id}
                                        style={[styles.gameProfileCard, selectedGameProfileId === p.id && styles.gameProfileCardActive]}
                                        onPress={() => setSelectedGameProfileId(p.id)}
                                    >
                                        <Image source={{ uri: p.game.iconUrl }} style={styles.gameIcon} contentFit="cover" />
                                        <View style={styles.gameInfo}>
                                            <Text style={styles.gameName}>{p.game.name}</Text>
                                            <Text style={styles.gameRank}>{p.rankLevel}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyWarning}>
                                <AlertCircle size={20} color="#F59E0B" />
                                <Text style={styles.emptyText}>Bạn chưa thêm Game Profile nào. Ghép đội cần thông tin Game để tìm đồng đội.</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.startBtn, !selectedGameProfileId && styles.startBtnDisabled]}
                            disabled={!selectedGameProfileId || startMatchMutation.isPending}
                            onPress={() => selectedGameProfileId && startMatchMutation.mutate(selectedGameProfileId)}
                        >
                            <LinearGradient colors={['#2563FF', '#7C3AED']} style={styles.startBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                <Zap color="#fff" fill="#fff" size={20} />
                                <Text style={styles.startBtnText}>BẮT ĐẦU GHÉP</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
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
    content: {
        flex: 1,
        padding: theme.spacing.lg,
    },
    setupContainer: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.colors.textSecondary,
        marginBottom: 16,
    },
    gamesList: {
        gap: 12,
    },
    gameProfileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 12,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    gameProfileCardActive: {
        borderColor: theme.colors.primary,
        backgroundColor: 'rgba(37,99,255,0.1)',
    },
    gameIcon: {
        width: 50,
        height: 50,
        borderRadius: 12,
        marginRight: 12,
    },
    gameInfo: {
        flex: 1,
    },
    gameName: {
        color: theme.colors.text,
        fontWeight: 'bold',
        fontSize: 16,
    },
    gameRank: {
        color: theme.colors.primary,
        fontWeight: '600',
        fontSize: 12,
        marginTop: 4,
    },
    emptyWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(245,158,11,0.1)',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(245,158,11,0.3)',
        gap: 12,
    },
    emptyText: {
        flex: 1,
        color: '#F59E0B',
        fontSize: 13,
        lineHeight: 20,
    },
    startBtn: {
        marginTop: 'auto',
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
    },
    startBtnDisabled: {
        opacity: 0.5,
    },
    startBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 10,
    },
    startBtnText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 16,
        letterSpacing: 2,
    },
    queueContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    radarEffect: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(37,99,255,0.15)',
        borderWidth: 2,
        borderColor: 'rgba(37,99,255,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    queueTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    queueGame: {
        fontSize: 16,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    timerText: {
        fontSize: 48,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 2,
        marginVertical: 20,
        fontVariant: ['tabular-nums'],
    },
    cancelBtn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: 'rgba(239,68,68,0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.3)',
    },
    cancelBtnText: {
        color: '#EF4444',
        fontWeight: 'bold',
    },
});
