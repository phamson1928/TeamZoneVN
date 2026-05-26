import React, { useLayoutEffect, useMemo, useState, useRef, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Animated,
} from 'react-native';
import { KeyRound, Mail, ArrowLeft, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Defs, RadialGradient, Stop, Circle } from 'react-native-svg';

import { Container } from '../components/Container';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { FadeInView } from '../components/AnimatedTransition';
import { useAlert } from '../components/AlertProvider';
import { theme } from '../theme';
import { apiClient } from '../api/client';
import { STRINGS } from '../constants/strings';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

/** Floating gradient orbs for background depth */
const FloatingOrbs = () => {
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createLoop = (anim: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ]),
      );

    createLoop(orb1Anim, 6000).start();
    createLoop(orb2Anim, 8000).start();
  }, [orb1Anim, orb2Anim]);

  const orb1Translate = orb1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 30],
  });
  const orb2Translate = orb2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });

  return (
    <View style={styles.orbsContainer} pointerEvents="none">
      <Animated.View
        style={[styles.orb, styles.orb1, { transform: [{ translateY: orb1Translate }] }]}
      >
        <Svg width={220} height={220}>
          <Defs>
            <RadialGradient id="forb1" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#7C3AED" stopOpacity={0.25} />
              <Stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={110} cy={110} r={110} fill="url(#forb1)" />
        </Svg>
      </Animated.View>
      <Animated.View
        style={[styles.orb, styles.orb2, { transform: [{ translateY: orb2Translate }] }]}
      >
        <Svg width={180} height={180}>
          <Defs>
            <RadialGradient id="forb2" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#2563FF" stopOpacity={0.2} />
              <Stop offset="100%" stopColor="#2563FF" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={90} cy={90} r={90} fill="url(#forb2)" />
        </Svg>
      </Animated.View>
    </View>
  );
};

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { showAlert } = useAlert();

  useLayoutEffect(() => {
    navigation.setOptions({ title: STRINGS.FORGOT_PASSWORD_TITLE });
  }, [navigation]);

  const normalizedEmail = useMemo(() => email.trim(), [email]);
  const keyboardOffset = useMemo(() => {
    if (Platform.OS !== 'ios') return 0;
    return ((theme as any)?.layout?.keyboardOffset as number | undefined) ?? 64;
  }, []);

  const validateEmail = () => {
    if (!normalizedEmail) {
      showAlert({
        title: STRINGS.ERROR_TITLE,
        message: STRINGS.REQUIRED_FIELD,
        variant: 'error',
      });
      return false;
    }

    const atIndex = normalizedEmail.indexOf('@');
    const isInvalid = atIndex <= 0 || atIndex === normalizedEmail.length - 1;
    if (!normalizedEmail.includes('@') || isInvalid) {
      showAlert({
        title: STRINGS.ERROR_TITLE,
        message: STRINGS.INVALID_EMAIL,
        variant: 'error',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    if (!validateEmail()) return;

    try {
      setIsLoading(true);
      const res = await apiClient.post('/auth/forgot-password', {
        email: normalizedEmail,
      });
      if (res?.data?.success) {
        setIsSuccess(true);
        return;
      }

      showAlert({
        title: STRINGS.ERROR_TITLE,
        message: STRINGS.API_UNREACHABLE_HINT,
        variant: 'error',
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || STRINGS.API_UNREACHABLE_HINT;
      showAlert({
        title: STRINGS.ERROR_TITLE,
        message,
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <Container>
      <FloatingOrbs />
      <View style={styles.screen}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={keyboardOffset}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Hero Section */}
            <FadeInView direction="down" duration={600}>
              <View style={styles.hero}>
                <View style={styles.logoGlowWrap}>
                  <LinearGradient
                    colors={['rgba(124,58,237,0.3)', 'rgba(37,99,255,0)']}
                    style={styles.logoGlow}
                  />
                </View>
                <View style={styles.logoIconBg}>
                  <LinearGradient
                    colors={['#7C3AED', '#2563FF']}
                    style={styles.logoGradientBg}
                  >
                    <KeyRound size={36} color="#FFF" strokeWidth={1.5} />
                  </LinearGradient>
                </View>
                <Text style={styles.logoText}>Quên mật khẩu</Text>
                <LinearGradient
                  colors={['#7C3AED', '#A78BFA']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.taglineGradientWrap}
                >
                  <Text style={styles.tagline}>KHÔI PHỤC TÀI KHOẢN</Text>
                </LinearGradient>
              </View>
            </FadeInView>

            {/* Form / Success Card */}
            <FadeInView direction="up" duration={500} delay={200}>
              <View style={styles.formCard}>
                {!isSuccess ? (
                  <>
                    <Text style={styles.title}>Quên mật khẩu</Text>
                    <Text style={styles.subtitle}>
                      Nhập email của bạn, chúng tôi sẽ gửi link khôi phục mật khẩu.
                    </Text>

                    <Input
                      label={STRINGS.EMAIL_LABEL}
                      placeholder={STRINGS.EMAIL_PLACEHOLDER}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="send"
                      onSubmitEditing={handleSubmit}
                      leftIcon={<Mail size={16} color="#64748B" />}
                    />

                    <Button
                      title={STRINGS.SEND_RESET_LINK}
                      onPress={handleSubmit}
                      loading={isLoading}
                      variant="primary"
                      size="lg"
                      style={styles.submitButton}
                    />

                    <View style={styles.footer}>
                      <ArrowLeft size={14} color="#A78BFA" />
                      <Pressable
                        onPress={handleBackToLogin}
                        disabled={isLoading}
                      >
                        <Text style={styles.signUpText}> Quay lại đăng nhập</Text>
                      </Pressable>
                    </View>
                  </>
                ) : (
                  <>
                    {/* Success State */}
                    <View style={styles.successIconWrap}>
                      <LinearGradient
                        colors={['#22C55E', '#10B981']}
                        style={styles.successIconBg}
                      >
                        <Check size={32} color="#FFF" strokeWidth={3} />
                      </LinearGradient>
                    </View>
                    <Text style={styles.title}>Đã gửi!</Text>
                    <Text style={styles.subtitle}>
                      Vui lòng kiểm tra hộp thư email của bạn
                    </Text>

                    <Button
                      title="Quay lại đăng nhập"
                      onPress={handleBackToLogin}
                      variant="primary"
                      size="lg"
                      style={styles.submitButton}
                    />
                  </>
                )}
              </View>
            </FadeInView>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  // ─── Orbs ─────────────────────────────
  orbsContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
  },
  orb1: {
    top: -40,
    right: -60,
  },
  orb2: {
    bottom: -30,
    left: -50,
  },

  // ─── Screen ───────────────────────────
  screen: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },

  // ─── Hero ─────────────────────────────
  hero: {
    alignItems: 'center',
    marginBottom: 36,
    paddingTop: 20,
  },
  logoGlowWrap: {
    position: 'absolute',
    top: -10,
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  logoIconBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  logoGradientBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: 1.5,
    marginBottom: 8,
    textShadowColor: 'rgba(124,58,237,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  taglineGradientWrap: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagline: {
    fontSize: 11,
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 3,
    fontWeight: '700',
  },

  // ─── Form Card ────────────────────────
  formCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 24,
    fontWeight: '500',
    lineHeight: 20,
  },
  submitButton: {
    marginTop: 8,
  },

  // ─── Success ──────────────────────────
  successIconWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  successIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },

  // ─── Footer ───────────────────────────
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  signUpText: {
    color: '#A78BFA',
    fontWeight: '700',
    fontSize: 14,
  },
});
