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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Svg,
  Path,
  G,
  Defs,
  RadialGradient,
  Stop,
  Circle,
} from 'react-native-svg';
import { Mail, Lock } from 'lucide-react-native';
import { Container } from '../components/Container';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { FadeInView } from '../components/AnimatedTransition';
import { useAlert } from '../components/AlertProvider';
import { theme } from '../theme';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { STRINGS } from '../constants/strings';
import { RootStackParamList } from '../navigation';

const GOOGLE_WEB_CLIENT_ID =
  '946383947788-mc938c7idvv3opb987p0fr1cbug97qs1.apps.googleusercontent.com';

// Simple Google Icon SVG
const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <G>
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </G>
  </Svg>
);

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

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
      {/* Orb 1 - Purple */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb1,
          { transform: [{ translateY: orb1Translate }] },
        ]}
      >
        <Svg width={220} height={220}>
          <Defs>
            <RadialGradient id="orb1" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#7C3AED" stopOpacity={0.25} />
              <Stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={110} cy={110} r={110} fill="url(#orb1)" />
        </Svg>
      </Animated.View>

      {/* Orb 2 - Blue */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb2,
          { transform: [{ translateY: orb2Translate }] },
        ]}
      >
        <Svg width={180} height={180}>
          <Defs>
            <RadialGradient id="orb2" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#2563FF" stopOpacity={0.2} />
              <Stop offset="100%" stopColor="#2563FF" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={90} cy={90} r={90} fill="url(#orb2)" />
        </Svg>
      </Animated.View>
    </View>
  );
};

export const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore(state => state.setAuth);
  const { showAlert } = useAlert();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      // Expo Go does not include native modules like @react-native-google-signin/google-signin.
      // We load it lazily so the screen can render without crashing.
      let GoogleSignin: any;
      try {
        ({ GoogleSignin } = await import(
          '@react-native-google-signin/google-signin'
        ));
      } catch {
        await showAlert({
          title: 'Không hỗ trợ trên Expo Go',
          message:
            'Đăng nhập Google cần Development Build (expo run:android/ios) hoặc chuyển sang expo-auth-session.',
          variant: 'info',
        });
        return;
      }

      try {
        GoogleSignin.configure({
          webClientId: GOOGLE_WEB_CLIENT_ID,
          offlineAccess: true,
        });
      } catch {
        await showAlert({
          title: 'Không hỗ trợ trên Expo Go',
          message:
            'Đăng nhập Google cần Development Build (expo run:android/ios) hoặc chuyển sang expo-auth-session.',
          variant: 'info',
        });
        return;
      }

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        throw new Error('No ID Token found');
      }

      const googleResponse = await apiClient.post('/auth/google', { idToken });
      const { data } = googleResponse.data;
      const { tokens } = data;

      const userResponse = await apiClient.get('/users/me', {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      });

      setAuth(userResponse.data.data, tokens.accessToken, tokens.refreshToken);
    } catch (error: any) {
      const code = error?.code;
      if (code === 'SIGN_IN_CANCELLED') {
        // user cancelled the login flow
      } else if (code === 'IN_PROGRESS') {
        // operation (e.g. sign in) is in progress already
      } else if (code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        await showAlert({
          title: 'Lỗi',
          message: 'Google Play Services không khả dụng',
          variant: 'error',
        });
      } else {
        const message =
          error.response?.data?.message ||
          error.message ||
          STRINGS.LOGIN_FAILED;
        await showAlert({
          title: STRINGS.LOGIN_FAILED,
          message: Array.isArray(message) ? message[0] : message,
          variant: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      await showAlert({
        title: STRINGS.ERROR_TITLE,
        message: STRINGS.REQUIRED_FIELD,
        variant: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const loginResponse = await apiClient.post('/auth/login', {
        email,
        password,
      });
      const { data } = loginResponse.data;
      const { tokens } = data;

      const userResponse = await apiClient.get('/users/me', {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      });

      setAuth(userResponse.data.data, tokens.accessToken, tokens.refreshToken);
    } catch (error: any) {
      let message: string =
        error.response?.data?.message || error.message || STRINGS.LOGIN_FAILED;
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        message = STRINGS.API_UNREACHABLE_HINT;
      }
      await showAlert({
        title: STRINGS.LOGIN_FAILED,
        message: Array.isArray(message) ? message[0] : message,
        variant: 'error',
      });
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
              {/* Glow behind logo */}
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
              <Text style={styles.title}>{STRINGS.LOGIN_TITLE}</Text>
              <Text style={styles.subtitle}>Chào mừng trở lại, gamer</Text>

              <Input
                label={STRINGS.EMAIL_LABEL}
                placeholder={STRINGS.EMAIL_PLACEHOLDER}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                leftIcon={<Mail size={16} color="#64748B" />}
              />

              <Input
                label={STRINGS.PASSWORD_LABEL}
                placeholder={STRINGS.PASSWORD_PLACEHOLDER}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                leftIcon={<Lock size={16} color="#64748B" />}
              />

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotPasswordText}>
                  {STRINGS.FORGOT_PASSWORD}
                </Text>
              </TouchableOpacity>

              <Button
                title={STRINGS.LOGIN_BUTTON}
                onPress={handleLogin}
                loading={loading}
                variant="primary"
                style={styles.loginButton}
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

              <Button
                title={STRINGS.GOOGLE_LOGIN_BUTTON}
                onPress={handleGoogleLogin}
                variant="outline"
                icon={<GoogleIcon />}
                style={styles.googleButton}
                size="md"
              />

              <View style={styles.footer}>
                <Text style={styles.footerText}>{STRINGS.NO_ACCOUNT}</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Register')}
                >
                  <Text style={styles.signUpText}>
                    {' '}
                    {STRINGS.REGISTER_TITLE}
                  </Text>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  forgotPasswordText: {
    color: '#A78BFA',
    fontSize: 13,
    fontWeight: '600',
  },
  loginButton: {
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
  googleButton: {
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
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
