import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Modal,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { useRoute, useNavigation } from '@react-navigation/native';
import { io, Socket } from 'socket.io-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Send,
  LogOut,
  ArrowLeft,
  Users,
  Trash2,
  X,
  Heart,
} from 'lucide-react-native';
import { format, isToday, isYesterday } from 'date-fns';
import { theme } from '../theme';
import { apiClient, BASE_URL } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { Message, UserPublicProfile } from '../types';
import { FadeInView, ScaleInView } from '../components/AnimatedTransition';

const SOCKET_URL = `${BASE_URL}/chat`;

function formatMessageDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return `Hôm qua ${format(d, 'HH:mm')}`;
  return format(d, 'dd/MM HH:mm');
}

function getAvatarColor(username: string) {
  const colors = [
    '#2563FF',
    '#7C3AED',
    '#059669',
    '#DC2626',
    '#D97706',
    '#0891B2',
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++)
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export const ChatRoomScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const { groupId, groupName } = route.params;

  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [selectedChatUser, setSelectedChatUser] = useState<{
    id: string;
    username: string;
    avatarUrl?: string | null;
  } | null>(null);
  const [showMemberList, setShowMemberList] = useState(false);
  const [pendingLikeUserIds, setPendingLikeUserIds] = useState<Set<string>>(
    new Set(),
  );
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const currentUser = useAuthStore(state => state.user);
  const accessToken = useAuthStore(state => state.accessToken);

  // realtime messages từ socket (tách riêng khỏi cache)
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([]);

  // Lấy lịch sử tin nhắn với CACHE: staleTime 5 phút, gcTime 10 phút
  // vào lại màn hình sẽ hiện các tin từ cache ngay lập tức không loading
  const { data: historyMessages = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['messages', groupId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/groups/${groupId}/messages`);
      const payload: any = data;
      const msgs = payload.data?.data || payload.data || [];
      // Backend đã reverse: trả về cũ → mới (ascending)
      return Array.isArray(msgs) ? (msgs as Message[]) : [];
    },
    staleTime: 5 * 60 * 1000, // 5 phút: không gọi API lại khi vào lại sớm
    gcTime: 10 * 60 * 1000, // 10 phút: giữ cache trong bộ nhớ
  });

  // Merge: history (cache) + realtime (socket), deduplicate theo id
  const messages = React.useMemo(() => {
    const historyIds = new Set(historyMessages.map((m: Message) => m.id));
    const newOnes = realtimeMessages.filter(m => !historyIds.has(m.id));
    return [...historyMessages, ...newOnes];
  }, [historyMessages, realtimeMessages]);

  // Scroll xuống cuối khi history load lần đầu
  useEffect(() => {
    if (!isLoadingHistory && historyMessages.length > 0) {
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: false }),
        100,
      );
    }
  }, [isLoadingHistory, historyMessages.length]);

  // Lấy thông tin group (số thành viên)
  const { data: groupDetail } = useQuery({
    queryKey: ['group-detail', groupId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/groups/${groupId}`);
      const payload: any = data;
      return payload.data || payload;
    },
  });

  const memberCount =
    groupDetail?.members?.length ?? groupDetail?._count?.members ?? 0;
  const selectedProfileId = selectedChatUser?.id ?? '';

  const {
    data: selectedProfile,
    isLoading: isLoadingSelectedProfile,
    isError: isSelectedProfileError,
    error: selectedProfileError,
    refetch: refetchSelectedProfile,
  } = useQuery({
    queryKey: ['public-profile', selectedProfileId],
    enabled: !!selectedProfileId,
    queryFn: async () => {
      const response = await apiClient.get(`/users/${selectedProfileId}`);
      const raw = response.data?.data;
      if (!raw?.id) {
        throw new Error('INVALID_PROFILE_RESPONSE');
      }
      return {
        ...raw,
        friendshipRelation: raw.friendshipRelation ?? 'NONE',
        pendingFriendshipId: raw.pendingFriendshipId ?? null,
      } as UserPublicProfile;
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async (isLiked: boolean) => {
      if (!selectedProfileId) return;
      if (isLiked) {
        await apiClient.delete(`/users/${selectedProfileId}/like`);
        return;
      }
      await apiClient.post(`/users/${selectedProfileId}/like`);
    },
    onMutate: async isLiked => {
      if (!selectedProfileId) return {};
      setPendingLikeUserIds(prev => {
        const next = new Set(prev);
        next.add(selectedProfileId);
        return next;
      });
      await queryClient.cancelQueries({
        queryKey: ['public-profile', selectedProfileId],
      });
      const previousProfile = queryClient.getQueryData([
        'public-profile',
        selectedProfileId,
      ]) as UserPublicProfile | undefined;
      if (previousProfile) {
        queryClient.setQueryData(['public-profile', selectedProfileId], {
          ...previousProfile,
          isLikedByMe: !isLiked,
          likeCount: isLiked
            ? Math.max(previousProfile.likeCount - 1, 0)
            : previousProfile.likeCount + 1,
        });
      }
      return { previousProfile, profileId: selectedProfileId };
    },
    onError: (_err, _isLiked, context) => {
      if (context?.previousProfile && context.profileId) {
        queryClient.setQueryData(
          ['public-profile', context.profileId],
          context.previousProfile,
        );
      }
    },
    onSettled: (_data, _error, _isLiked, context) => {
      const profileId = context?.profileId ?? selectedProfileId;
      if (profileId) {
        setPendingLikeUserIds(prev => {
          const next = new Set(prev);
          next.delete(profileId);
          return next;
        });
      }
      if (profileId) {
        queryClient.invalidateQueries({
          queryKey: ['public-profile', profileId],
        });
      }
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await apiClient.delete(`/messages/${messageId}`);
      return messageId;
    },
    onSuccess: messageId => {
      // Xóa ở cả cache lẫn realtime
      queryClient.setQueryData<Message[]>(['messages', groupId], old =>
        old ? old.filter(m => m.id !== messageId) : [],
      );
      setRealtimeMessages(prev => prev.filter(m => m.id !== messageId));
      setShowDeleteModal(null);
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/groups/${groupId}/leave`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my_groups'] });
      setShowLeaveModal(false);
      navigation.goBack();
    },
  });

  // Socket setup
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      auth: { token: `Bearer ${accessToken}` },
      transports: ['websocket'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('joinRoom', { groupId });
    });

    newSocket.on('newMessage', (msg: Message) => {
      // Chỉ append vào realtime list, không đụng vào cache
      setRealtimeMessages(prev => [...prev, msg]);
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        80,
      );
    });

    newSocket.on('userTyping', ({ userId, username, isTyping }: any) => {
      if (userId === currentUser?.id) return;
      setTypingUsers(prev => {
        const next = { ...prev };
        if (isTyping) {
          next[userId] = username;
        } else {
          delete next[userId];
        }
        return next;
      });
    });

    return () => {
      newSocket.emit('leaveRoom', { groupId });
      newSocket.disconnect();
    };
  }, [groupId, accessToken, currentUser?.id]);

  // Typing indicator
  useEffect(() => {
    if (!socket) return;
    if (inputText.trim().length > 0) {
      socket.emit('typing', { groupId, isTyping: true });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { groupId, isTyping: false });
      }, 3000);
    } else {
      socket.emit('typing', { groupId, isTyping: false });
    }
  }, [inputText, socket, groupId]);

  const handleSend = () => {
    if (!inputText.trim() || !socket) return;
    socket.emit('sendMessage', { groupId, content: inputText.trim() });
    socket.emit('typing', { groupId, isTyping: false });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setInputText('');
  };

  const profileErrorMessage = (() => {
    const err: any = selectedProfileError;
    const status = err?.response?.status;
    const apiMessage = err?.response?.data?.message;
    const normalized = Array.isArray(apiMessage) ? apiMessage[0] : apiMessage;

    if (typeof normalized === 'string' && normalized.trim().length > 0) {
      return normalized;
    }
    if (status === 403) {
      return 'Tài khoản này đã bị khóa và không thể xem hồ sơ.';
    }
    if (status === 404) {
      return 'Không tìm thấy người dùng này.';
    }
    if (status === 400) {
      return 'Dữ liệu hồ sơ không hợp lệ.';
    }
    return 'Không thể tải hồ sơ người dùng.';
  })();

  const openUserPreview = (sender: Message['sender']) => {
    if (!sender?.id || sender.id === currentUser?.id) return;
    setSelectedChatUser({
      id: sender.id,
      username: sender.username,
      avatarUrl: sender.avatarUrl,
    });
  };

  const closeUserPreview = () => {
    setSelectedChatUser(null);
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMine = item.sender?.id === currentUser?.id;
    const isFirstInGroup =
      index === messages.length - 1 ||
      messages[index + 1]?.sender?.id !== item.sender?.id;
    const avatarColor = getAvatarColor(item.sender?.username || '?');

    return (
      <FadeInView direction="up" delay={Math.min(index * 30, 300)} duration={350}>
        <View
          style={[styles.msgRow, isMine ? styles.msgRowMine : styles.msgRowOther]}
        >
          {/* Avatar cho người khác */}
          {!isMine &&
            (isFirstInGroup ? (
              <TouchableOpacity
                style={[styles.avatar, { backgroundColor: avatarColor }]}
                onPress={() => openUserPreview(item.sender)}
                activeOpacity={0.8}
              >
                {item.sender?.avatarUrl ? (
                  <Image
                    source={{ uri: item.sender.avatarUrl }}
                    style={styles.avatarImg}
                    contentFit="cover"
                  />
                ) : (
                  <Text style={styles.avatarLetter}>
                    {item.sender?.username?.charAt(0)?.toUpperCase() || '?'}
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <View style={[styles.avatar, { opacity: 0 }]} />
            ))}

          <View
            style={[
              styles.bubbleWrapper,
              isMine ? styles.bubbleWrapperMine : styles.bubbleWrapperOther,
            ]}
          >
            {/* Tên người gửi (chỉ hiện dòng đầu nhóm) */}
            {!isMine && isFirstInGroup && (
              <TouchableOpacity
                onPress={() => openUserPreview(item.sender)}
                activeOpacity={0.8}
              >
                <Text style={[styles.senderName, { color: avatarColor }]}>
                  {item.sender?.username}
                </Text>
              </TouchableOpacity>
            )}

            <ScaleInView>
              <View
                style={[
                  styles.bubble,
                  isMine ? styles.bubbleMine : styles.bubbleOther,
                ]}
              >
                <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>
                  {item.content}
                </Text>
                <Text style={[styles.bubbleTime, isMine && styles.bubbleTimeMine]}>
                  {formatMessageDate(item.createdAt)}
                </Text>
              </View>
            </ScaleInView>
          </View>

          {/* Nút xóa cho tin nhắn của mình */}
          {isMine && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => setShowDeleteModal(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Trash2 size={13} color="rgba(255,255,255,0.25)" />
            </TouchableOpacity>
          )}
        </View>
      </FadeInView>
    );
  };

  const typingNames = Object.values(typingUsers);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, 16) + 10, paddingBottom: 10 },
        ]}
      >
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerCenter}
          activeOpacity={0.7}
          onPress={() => setShowMemberList(true)}
        >
          <Text style={styles.headerTitle} numberOfLines={1}>
            {groupName || 'Phòng Chat'}
          </Text>
          {memberCount > 0 && (
            <View style={styles.headerMeta}>
              <View style={styles.onlineDot} />
              <Users size={11} color="rgba(255,255,255,0.5)" />
              <Text style={styles.headerMetaText}>
                {memberCount} thành viên
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerMenuBtn}
          onPress={() => setShowLeaveModal(true)}
          activeOpacity={0.7}
        >
          <LogOut size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        {/* Message List */}
        {isLoadingHistory && messages.length === 0 ? (
          // Spinner chỉ hiện khi chưa có cache nào
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
          </View>
        ) : !isLoadingHistory && messages.length === 0 ? (
          // Empty chỉ hiện khi đã load xong và thực sự không có tin
          <View style={styles.center}>
            <View style={styles.emptyIcon}>
              <Users size={32} color="rgba(255,255,255,0.2)" />
            </View>
            <Text style={styles.emptyTitle}>Chưa có tin nhắn nào</Text>
            <Text style={styles.emptySubtitle}>
              Hãy là người đầu tiên gửi tin nhắn! 👋
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        {/* Typing Indicator */}
        {typingNames.length > 0 && (
          <View style={styles.typingContainer}>
            <View style={styles.typingDots}>
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
            </View>
            <Text style={styles.typingText}>
              {typingNames.slice(0, 2).join(', ')}
              {typingNames.length > 2 ? ` +${typingNames.length - 2}` : ''} đang
              nhập...
            </Text>
          </View>
        )}

        {/* Input Bar */}
        <View
          style={[
            styles.inputBar,
            { paddingBottom: Math.max(insets.bottom, 12) + 6 },
          ]}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Nhắn tin..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={2000}
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.sendBtn,
              !inputText.trim() && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
          >
            <Send size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Modal Rời nhóm */}
      <Modal
        visible={showLeaveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLeaveModal(false)}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.alertBox}>
            <View
              style={[
                styles.alertIconBox,
                { backgroundColor: 'rgba(239,68,68,0.1)' },
              ]}
            >
              <LogOut size={24} color="#EF4444" />
            </View>
            <Text style={styles.alertTitle}>Rời nhóm</Text>
            <Text style={styles.alertMessage}>
              Bạn có chắc muốn rời khỏi nhóm "{groupName}"?
            </Text>
            <View style={styles.alertActions}>
              <TouchableOpacity
                style={[styles.alertBtn, styles.alertBtnCancel]}
                onPress={() => setShowLeaveModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.alertBtnCancelText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.alertBtn, styles.alertBtnDanger]}
                onPress={() => leaveGroupMutation.mutate()}
                disabled={leaveGroupMutation.isPending}
                activeOpacity={0.8}
              >
                <Text style={styles.alertBtnDangerText}>
                  {leaveGroupMutation.isPending ? 'Đang rời...' : 'Rời nhóm'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Xóa tin nhắn */}
      <Modal
        visible={!!showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(null)}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.alertBox}>
            <View
              style={[
                styles.alertIconBox,
                { backgroundColor: 'rgba(239,68,68,0.1)' },
              ]}
            >
              <Trash2 size={24} color="#EF4444" />
            </View>
            <Text style={styles.alertTitle}>Xóa tin nhắn</Text>
            <Text style={styles.alertMessage}>
              Tin nhắn này sẽ bị xóa vĩnh viễn.
            </Text>
            <View style={styles.alertActions}>
              <TouchableOpacity
                style={[styles.alertBtn, styles.alertBtnCancel]}
                onPress={() => setShowDeleteModal(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.alertBtnCancelText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.alertBtn, styles.alertBtnDanger]}
                onPress={() =>
                  showDeleteModal &&
                  deleteMessageMutation.mutate(showDeleteModal)
                }
                disabled={deleteMessageMutation.isPending}
                activeOpacity={0.8}
              >
                <Text style={styles.alertBtnDangerText}>
                  {deleteMessageMutation.isPending ? 'Đang xóa...' : 'Xóa'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Danh sách thành viên (bottom sheet) */}
      <Modal
        visible={showMemberList}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMemberList(false)}
        statusBarTranslucent
      >
        <Pressable
          style={styles.memberListOverlay}
          onPress={() => setShowMemberList(false)}
        >
          <Pressable style={styles.memberListSheet} onPress={() => {}}>
            {/* Handle bar */}
            <View style={styles.memberListHandleBar}>
              <View style={styles.memberListHandle} />
            </View>

            {/* Title */}
            <Text style={styles.memberListTitle}>
              {memberCount} thành viên
            </Text>

            {/* Member list */}
            <FlatList
              data={groupDetail?.members ?? []}
              keyExtractor={(item: any) => item.userId}
              style={styles.memberListScroll}
              contentContainerStyle={styles.memberListScrollContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }: { item: any }) => {
                const isLeader = item.role === 'LEADER';
                const avatarColor = getAvatarColor(
                  item.user?.username || '?',
                );

                return (
                  <TouchableOpacity
                    style={styles.memberRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      setShowMemberList(false);
                      navigation.navigate('PublicProfile', {
                        userId: item.userId,
                      });
                    }}
                  >
                    <View
                      style={[
                        styles.memberAvatar,
                        { backgroundColor: avatarColor },
                      ]}
                    >
                      {item.user?.avatarUrl ? (
                        <Image
                          source={{ uri: item.user.avatarUrl }}
                          style={styles.memberAvatarImg}
                          contentFit="cover"
                        />
                      ) : (
                        <Text style={styles.memberAvatarLetter}>
                          {item.user?.username
                            ?.charAt(0)
                            ?.toUpperCase() || '?'}
                        </Text>
                      )}
                    </View>

                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName} numberOfLines={1}>
                        {item.user?.username || 'Unknown'}
                      </Text>
                      {isLeader && (
                        <View style={styles.leaderBadge}>
                          <Text style={styles.leaderBadgeText}>
                            Trưởng nhóm
                          </Text>
                        </View>
                      )}
                    </View>

                    {isLeader && (
                      <View style={styles.crownIcon}>
                        <Text style={styles.crownText}>👑</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.memberListEmpty}>
                  <Text style={styles.memberListEmptyText}>
                    Không có thành viên
                  </Text>
                </View>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal Hồ sơ nhanh từ chat */}
      <Modal
        visible={!!selectedChatUser}
        transparent
        animationType="fade"
        onRequestClose={closeUserPreview}
        statusBarTranslucent
      >
        <Pressable style={styles.modalOverlay} onPress={closeUserPreview}>
          <Pressable style={styles.userPreviewCard} onPress={() => {}}>
            <View style={styles.userPreviewHeader}>
              <View style={styles.userPreviewIdentity}>
                <View
                  style={[
                    styles.previewAvatar,
                    {
                      backgroundColor: getAvatarColor(
                        selectedChatUser?.username || '?',
                      ),
                    },
                  ]}
                >
                  {selectedChatUser?.avatarUrl ? (
                    <Image
                      source={{ uri: selectedChatUser.avatarUrl }}
                      style={styles.previewAvatarImg}
                      contentFit="cover"
                    />
                  ) : (
                    <Text style={styles.previewAvatarLetter}>
                      {selectedChatUser?.username?.charAt(0)?.toUpperCase() ||
                        '?'}
                    </Text>
                  )}
                </View>
                <View style={styles.userPreviewTextWrap}>
                  <Text style={styles.userPreviewName} numberOfLines={1}>
                    {selectedChatUser?.username || 'Người dùng'}
                  </Text>
                  <Text style={styles.userPreviewSub}>Hồ sơ công khai</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={closeUserPreview}
                style={styles.previewCloseBtn}
                activeOpacity={0.8}
              >
                <X size={18} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>

            {isLoadingSelectedProfile ? (
              <View style={styles.userPreviewBodyState}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.userPreviewStateText}>
                  Đang tải thông tin...
                </Text>
              </View>
            ) : isSelectedProfileError || !selectedProfile ? (
              <View style={styles.userPreviewBodyState}>
                <Text style={styles.userPreviewStateText}>
                  {profileErrorMessage}
                </Text>
                <TouchableOpacity
                  style={styles.userPreviewRetryBtn}
                  onPress={() => refetchSelectedProfile()}
                  activeOpacity={0.85}
                >
                  <Text style={styles.userPreviewRetryText}>Thử lại</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.previewStatsRow}>
                  <View style={styles.previewStatPill}>
                    <Heart
                      size={14}
                      color={
                        selectedProfile.isLikedByMe
                          ? '#EF4444'
                          : 'rgba(255,255,255,0.65)'
                      }
                      fill={
                        selectedProfile.isLikedByMe ? '#EF4444' : 'transparent'
                      }
                    />
                    <Text style={styles.previewStatText}>
                      {selectedProfile.likeCount} tim
                    </Text>
                  </View>
                </View>
                <Text style={styles.userPreviewBio} numberOfLines={3}>
                  {selectedProfile.profile?.bio?.trim() ||
                    'Người dùng này chưa có giới thiệu.'}
                </Text>
                <View style={styles.userPreviewActions}>
                  <TouchableOpacity
                    style={[
                      styles.userPreviewActionBtn,
                      styles.userPreviewLikeBtn,
                      selectedProfile.isLikedByMe &&
                        styles.userPreviewUnlikeBtn,
                    ]}
                    onPress={() =>
                      toggleLikeMutation.mutate(selectedProfile.isLikedByMe)
                    }
                    disabled={pendingLikeUserIds.has(selectedProfile.id)}
                    activeOpacity={0.85}
                  >
                    <Heart
                      size={16}
                      color={selectedProfile.isLikedByMe ? '#EF4444' : '#FFF'}
                      fill={
                        selectedProfile.isLikedByMe ? '#EF4444' : 'transparent'
                      }
                    />
                    <Text style={styles.userPreviewActionText}>
                      {pendingLikeUserIds.has(selectedProfile.id)
                        ? 'Đang cập nhật...'
                        : selectedProfile.isLikedByMe
                        ? 'Bỏ tim'
                        : 'Thả tim'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.userPreviewActionBtn,
                      styles.userPreviewOpenBtn,
                    ]}
                    onPress={() => {
                      if (!selectedChatUser?.id) return;
                      closeUserPreview();
                      navigation.navigate('PublicProfile', {
                        userId: selectedChatUser.id,
                      });
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.userPreviewActionText}>
                      Xem chi tiết
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  flex: {
    flex: 1,
  },

  // ─── Header ───────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#0E1A2E',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 2,
  },
  headerMetaText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
  },
  headerMenuBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },

  // ─── List ──────────────────────────────────────────────
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    lineHeight: 20,
  },

  // ─── Message Row ───────────────────────────────────────
  msgRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'flex-end',
  },
  msgRowMine: {
    justifyContent: 'flex-end',
  },
  msgRowOther: {
    justifyContent: 'flex-start',
  },

  // ─── Avatar ────────────────────────────────────────────
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    flexShrink: 0,
  },
  avatarImg: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  avatarLetter: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },

  // ─── Bubble ────────────────────────────────────────────
  bubbleWrapper: {
    maxWidth: '78%',
  },
  bubbleWrapperMine: {
    alignItems: 'flex-end',
  },
  bubbleWrapperOther: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 3,
    marginLeft: 2,
  },
  bubble: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 16,
  },
  bubbleMine: {
    backgroundColor: '#2563FF',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  bubbleText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  bubbleTextMine: {
    color: '#FFF',
  },
  bubbleTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  bubbleTimeMine: {
    color: 'rgba(255,255,255,0.55)',
  },

  // ─── Delete ────────────────────────────────────────────
  deleteBtn: {
    marginLeft: 6,
    marginBottom: 4,
    padding: 4,
  },

  // ─── Typing ────────────────────────────────────────────
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 6,
    gap: 8,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 3,
  },
  typingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  typingText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontStyle: 'italic',
  },

  // ─── Input Bar ─────────────────────────────────────────
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#0A1628',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    minHeight: 44,
    maxHeight: 120,
    justifyContent: 'center',
  },
  input: {
    color: '#FFF',
    fontSize: 15,
    lineHeight: 20,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 0 : 2,
    shadowColor: '#2563FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  sendBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    shadowOpacity: 0,
    elevation: 0,
  },

  // ─── Modals ────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertBox: {
    backgroundColor: '#0F172A',
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  alertIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  alertBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBtnCancel: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  alertBtnCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
  },
  alertBtnDanger: {
    backgroundColor: '#EF4444',
  },
  alertBtnDangerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },

  // User preview modal
  userPreviewCard: {
    backgroundColor: '#0F172A',
    width: '100%',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  userPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userPreviewIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  previewAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  previewAvatarImg: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  previewAvatarLetter: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
  },
  userPreviewTextWrap: {
    flex: 1,
  },
  userPreviewName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  userPreviewSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 2,
  },
  previewCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  userPreviewBodyState: {
    paddingTop: 16,
    paddingBottom: 10,
    alignItems: 'center',
    gap: 8,
  },
  userPreviewStateText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  userPreviewRetryBtn: {
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  userPreviewRetryText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },
  previewStatsRow: {
    marginTop: 14,
    marginBottom: 10,
    flexDirection: 'row',
  },
  previewStatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  previewStatText: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    fontSize: 12,
  },
  userPreviewBio: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    lineHeight: 19,
  },
  userPreviewActions: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },
  userPreviewActionBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 10,
  },
  userPreviewLikeBtn: {
    backgroundColor: theme.colors.primary,
  },
  userPreviewUnlikeBtn: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  userPreviewOpenBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  userPreviewActionText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // ─── Member List Modal (bottom sheet) ────────────────
  memberListOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  memberListSheet: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  memberListHandleBar: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  memberListHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  memberListTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFF',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  memberListScroll: {
    maxHeight: 400,
  },
  memberListScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 14,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  memberAvatarLetter: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    flexShrink: 1,
  },
  leaderBadge: {
    backgroundColor: 'rgba(37,99,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(37,99,255,0.3)',
  },
  leaderBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#60A5FA',
  },
  crownIcon: {
    marginLeft: 8,
  },
  crownText: {
    fontSize: 18,
  },
  memberListEmpty: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  memberListEmptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
  },
});
