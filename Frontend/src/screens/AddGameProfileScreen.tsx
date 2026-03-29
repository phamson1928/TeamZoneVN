import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check } from 'lucide-react-native';

import { Container } from '../components/Container';
import { Button } from '../components/Button';
import { ThemedDialog, type ThemedDialogVariant } from '../components/ThemedDialog';
import { apiClient } from '../api/client';
import { theme } from '../theme';
import { Game } from '../types';

export const AddGameProfileScreen = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [dialog, setDialog] = useState<{
    title: string;
    message: string;
    variant: ThemedDialogVariant;
    onClose: () => void;
  } | null>(null);

  const { data: games, isLoading: isLoadingGames } = useQuery({
    queryKey: ['games', 'mobile'],
    queryFn: async () => {
      const response = await apiClient.get('/games/mobile');
      return response.data.data;
    },
  });

  const addGameProfileMutation = useMutation({
    mutationFn: async (data: { gameId: string }) => {
      const response = await apiClient.post('/user-game-profiles', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-game-profiles'] });
      setDialog({
        title: 'Thành công',
        message: 'Đã thêm game vào hồ sơ.',
        variant: 'success',
        onClose: () => {
          setDialog(null);
          navigation.goBack();
        },
      });
    },
    onError: () => {
      setDialog({
        title: 'Lỗi',
        message: 'Không thể thêm hồ sơ game. Vui lòng thử lại.',
        variant: 'error',
        onClose: () => setDialog(null),
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedGame) {
      setDialog({
        title: 'Thông báo',
        message: 'Vui lòng chọn game.',
        variant: 'info',
        onClose: () => setDialog(null),
      });
      return;
    }
    addGameProfileMutation.mutate({ gameId: selectedGame.id });
  };

  const renderGameItem = ({ item }: { item: Game }) => (
    <TouchableOpacity
      style={[
        styles.gameCard,
        selectedGame?.id === item.id && styles.gameCardSelected,
      ]}
      onPress={() => setSelectedGame(item)}
    >
      <Image source={{ uri: item.iconUrl }} style={styles.gameIcon}  contentFit="cover" transition={500} cachePolicy="disk"/>
      <Text style={styles.gameName} numberOfLines={1}>
        {item.name}
      </Text>
      {selectedGame?.id === item.id && (
        <View style={styles.checkIcon}>
          <Check size={16} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Container>
      <ThemedDialog
        visible={dialog !== null}
        title={dialog?.title ?? ''}
        message={dialog?.message ?? ''}
        variant={dialog?.variant ?? 'info'}
        primaryLabel="Đóng"
        onPrimary={() => dialog?.onClose()}
        onBackdrop={() => dialog?.onClose()}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm game</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.stepTitle}>Chọn game đã chơi</Text>
        {isLoadingGames ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <FlatList
            data={games}
            renderItem={renderGameItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            columnWrapperStyle={styles.gameListColumn}
            contentContainerStyle={styles.gameListContent}
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 400 }}
          />
        )}

        <View style={styles.footer}>
          <Button
            title="Hoàn tất"
            onPress={handleSubmit}
            disabled={!selectedGame || addGameProfileMutation.isPending}
            style={styles.submitButton}
          />
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.accent,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  gameListContent: {
    paddingBottom: theme.spacing.md,
  },
  gameListColumn: {
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  gameCard: {
    width: '30%',
    aspectRatio: 0.8,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  gameCardSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 2.5,
    backgroundColor: theme.colors.surface,
  },
  gameIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginBottom: theme.spacing.xs,
  },
  gameName: {
    fontSize: 12,
    color: theme.colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  checkIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    padding: 2,
  },
  footer: {
    marginTop: 'auto',
  },
  submitButton: {
    width: '100%',
  },
});
