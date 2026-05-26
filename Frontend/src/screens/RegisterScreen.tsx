import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, User } from 'lucide-react-native';
import { Svg, Defs, RadialGradient, Stop, Circle } from 'react-native-svg';

import { Container } from '../components/Container';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { FadeInView } from '../components/AnimatedTransition';
import { useAlert } from '../components/AlertProvider';
import { theme } from '../theme';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

import { STRINGS } from '../constants/strings';

const TEAMZONE_LOGO = require('../../assets/non-background-teamzonevn-logo.png');

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
        style={[
          styles.orb,
          styles.orb1,
          { transform: [{ translateY: orb1Translate }] },
        ]}
      >
        <Svg width={220} height={220}>
          <Defs>
            <RadialGradient id="orb1r" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#7C3AED" stopOpacity={0.25} />
              <Stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={110} cy={110} r={110} fill="url(#orb1r)" />
        </Svg>
      </Animated.View>
      <Animated.View
        style={[
          styles.orb,
          styles.orb2,
          { transform: [{ translateY: orb2Translate }] },
        ]}
      >
        <Svg width={180} height={180}>
          <Defs>
            <RadialGradient id="orb2r" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#2563FF" stopOpacity={0.2} />
              <Stop offset="100%" stopColor="#2563FF" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={90} cy={90} r={90} fill="url(#orb2r)" />
        </Svg>
      </Animated.View>
    </View>
  );
};

export const RegisterScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const setAuth = useAuthStore(state => state.setAuth);
  const { showAlert } = useAlert();

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!username) newErrors.username = STRINGS.REQUIRED_FIELD;
    if (!email) newErrors.email = STRINGS.REQUIRED_FIELD;
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = STRINGS.INVALID_EMAIL;

    if (!password) newErrors.password = STRINGS.REQUIRED_FIELD;
    else if (password.length < 6) newErrors.password = STRINGS.SHORT_PASSWORD;

    if (password !== confirmPassword)
      newErrors.confirmPassword = STRINGS.PASSWORD_MISMATCH;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await apiClient.post('/auth/register', {
        email,
        username,
        password,
      });

      const { data } = response.data;
      const { tokens } = data;

      const userResponse = await apiClient.get('/users/me', {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      });

      setAuth(userResponse.data.data, tokens.accessToken, tokens.refreshToken);
    } catch (error: any) {
      console.log('Registration Error Details:', error.response?.data);
      const message = error.response?.data?.message;

      if (Array.isArray(message)) {
        const backendErrors: { [key: string]: string } = {};
        message.forEach((msg: string) => {
          if (msg.toLowerCase().includes('email')) backendErrors.email = msg;
          else if (msg.toLowerCase().includes('username'))
            backendErrors.username = msg;
          else if (msg.toLowerCase().includes('password'))
            backendErrors.password = msg;
        });

        if (Object.keys(backendErrors).length > 0) {
          setErrors(backendErrors);
        } else {
          await showAlert({
            title: STRINGS.REGISTRATION_FAILED,
            message: message[0],
            variant: 'error',
          });
        }
      } else {
        await showAlert({
          title: STRINGS.REGISTRATION_FAILED,
          message: message || STRINGS.ERROR_TITLE,
          variant: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <FloatingOrbs />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <FadeInView direction="down" duration={600}>
            <View style={styles.hero}>
              <View style={styles.logoGlowWrap}>
                <LinearGradient
                  colors={['rgba(37,99,255,0.3)', 'rgba(124,58,237,0)']}
                  style={styles.logoGlow}
                />
              </View>
              <View style={styles.logoIconBg}>
                <LinearGradient
                  colors={['#2563FF', '#7C3AED']}
                  style={styles.logoGradientBg}
                >
                  <Image
                    source={TEAMZONE_LOGO}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </LinearGradient>
              </View>
              <Text style={styles.logoText}>TeamZoneVN</Text>
              <LinearGradient
                colors={['#2563FF', '#A78BFA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.taglineGradientWrap}
              >
                <Text style={styles.tagline}>TÌM BẠN · CHIẾN GAME</Text>
              </LinearGradient>
            </View>
          </FadeInView>

          {/* Form Card */}
          <FadeInView direction="up" duration={500} delay={200}>
            <View style={styles.formCard}>
              <Text style={styles.title}>ĐĂNG KÝ</Text>
              <Text style={styles.subtitle}>
                Tham gia cùng cộng đồng game thủ
              </Text>

              <Input
                label={STRINGS.USERNAME_LABEL}
                placeholder={STRINGS.USERNAME_PLACEHOLDER}
                value={username}
                onChangeText={text => {
                  setUsername(text);
                  setErrors({ ...errors, username: '' });
                }}
                autoCapitalize="none"
                error={errors.username}
                style={styles.input}
                leftIcon={<User size={16} color="#64748B" />}
              />

              <Input
                label={STRINGS.EMAIL_LABEL}
                placeholder={STRINGS.EMAIL_PLACEHOLDER}
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  setErrors({ ...errors, email: '' });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                style={styles.input}
                leftIcon={<Mail size={16} color="#64748B" />}
              />

              <Input
                label={STRINGS.PASSWORD_LABEL}
                placeholder={STRINGS.PASSWORD_MIN_HINT}
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  setErrors({ ...errors, password: '' });
                }}
                secureTextEntry
                error={errors.password}
                style={styles.input}
                leftIcon={<Lock size={16} color="#64748B" />}
              />

              <Input
                label={STRINGS.CONFIRM_PASSWORD_LABEL}
                placeholder={STRINGS.CONFIRM_PASSWORD_PLACEHOLDER}
                value={confirmPassword}
                onChangeText={text => {
                  setConfirmPassword(text);
                  setErrors({ ...errors, confirmPassword: '' });
                }}
                secureTextEntry
                error={errors.confirmPassword}
                style={styles.input}
                leftIcon={<Lock size={16} color="#64748B" />}
              />

              <Button
                title={STRINGS.REGISTER_BUTTON}
                onPress={handleRegister}
                loading={loading}
                variant="primary"
                style={styles.registerButton}
                size="lg"
              />

              <View style={styles.divider}>
                <LinearGradient
                  colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.08)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.dividerLine}
                />
                <Text style={styles.dividerText}>HOẶC</Text>
                <LinearGradient
                  colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.dividerLine}
                />
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>{STRINGS.HAVE_ACCOUNT}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.signUpText}> {STRINGS.LOGIN_TITLE}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </FadeInView>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
};

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

  // ─── Scroll ───────────────────────────
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
    shadowColor: '#2563FF',
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
  logoImage: {
    width: 52,
    height: 52,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: 1.5,
    marginBottom: 8,
    textShadowColor: 'rgba(37,99,255,0.3)',
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
  },
  input: {},
  registerButton: {
    marginTop: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 14,
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  signUpText: {
    color: '#A78BFA',
    fontWeight: '700',
    fontSize: 14,
  },
});
