import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react-native';
import { theme } from '../theme';

export type ThemedDialogVariant = 'success' | 'error' | 'info';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  variant?: ThemedDialogVariant;
  primaryLabel?: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  onBackdrop?: () => void;
  /** Nút chính: 'primary' xanh | 'accent' tím | 'muted' xám — mặc định primary */
  primaryTone?: 'primary' | 'accent' | 'muted';
  primaryDestructive?: boolean;
};

const VARIANT_ICON = {
  success: { Icon: CheckCircle2, color: '#22C55E' },
  error: { Icon: AlertCircle, color: '#EF4444' },
  info: { Icon: Info, color: '#2563FF' },
} as const;

const PRIMARY_BG = {
  primary: theme.colors.buttonSolidPrimary,
  accent: theme.colors.buttonSolidAccent,
  muted: theme.colors.buttonSolidMuted,
} as const;

/**
 * Dialog tối giản — khung phẳng, nút không gradient (3 tông màu cố định).
 */
export function ThemedDialog({
  visible,
  title,
  message,
  variant = 'info',
  primaryLabel = 'Đã hiểu',
  onPrimary,
  secondaryLabel,
  onSecondary,
  primaryDestructive = false,
  onBackdrop,
  primaryTone = 'primary',
}: Props) {
  const { Icon, color } = VARIANT_ICON[variant];
  const closeFromBackdrop = onBackdrop ?? onSecondary ?? onPrimary;
  const solidPrimary = PRIMARY_BG[primaryTone];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={closeFromBackdrop}>
      <Pressable style={styles.backdrop} onPress={closeFromBackdrop}>
        <Pressable style={styles.cardWrap} onPress={e => e.stopPropagation()}>
          <View style={styles.cardOuter}>
            <View style={styles.cardInner}>
              <View style={[styles.iconCircle, { backgroundColor: color + '18' }]}>
                <Icon size={28} color={color} strokeWidth={2.2} />
              </View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              <View style={styles.actions}>
                {secondaryLabel && onSecondary ? (
                  <TouchableOpacity style={styles.secondaryBtn} onPress={onSecondary} activeOpacity={0.85}>
                    <Text style={styles.secondaryBtnText}>{secondaryLabel}</Text>
                  </TouchableOpacity>
                ) : null}
                {primaryDestructive ? (
                  <TouchableOpacity style={styles.destructiveBtn} onPress={onPrimary} activeOpacity={0.9}>
                    <Text style={styles.destructiveBtnText}>{primaryLabel}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={onPrimary}
                    activeOpacity={0.92}
                    style={[styles.primaryBtn, { backgroundColor: solidPrimary }]}
                  >
                    <Text style={styles.primaryLabel}>{primaryLabel}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  cardWrap: {
    width: '100%',
    maxWidth: 340,
  },
  cardOuter: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#1E293B',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  cardInner: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 22,
  },
  actions: {
    width: '100%',
    gap: 10,
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  primaryLabel: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    width: '100%',
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  secondaryBtnText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontWeight: '700',
  },
  destructiveBtn: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  destructiveBtnText: {
    color: '#F87171',
    fontSize: 15,
    fontWeight: '800',
  },
});
