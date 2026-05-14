import React, { useLayoutEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { KeyRound } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
            <FadeInView direction="down" duration={600}>
              <View style={styles.card}>
                {!isSuccess ? (
                  <>
                    {/* Icon */}
                    <View style={styles.iconRing}>
                      <LinearGradient
                        colors={['#7C3AED', '#2563FF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.iconGradient}
                      >
                        <KeyRound size={28} color="#FFF" strokeWidth={1.8} />
                      </LinearGradient>
                    </View>

                    <Text style={styles.title}>{STRINGS.FORGOT_PASSWORD_TITLE}</Text>
                    <Text style={styles.subtitle}>
                      {STRINGS.FORGOT_PASSWORD_SUBTITLE}
                    </Text>

                    <View style={styles.form}>
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
                      />

                      <Button
                        title={STRINGS.SEND_RESET_LINK}
                        onPress={handleSubmit}
                        loading={isLoading}
                      />

                      <Pressable
                        onPress={handleBackToLogin}
                        disabled={isLoading}
                        style={({ pressed }) => [
                          styles.linkWrap,
                          pressed && styles.linkPressed,
                        ]}
                        accessibilityRole="button"
                      >
                        <Text style={styles.link}>{STRINGS.BACK_TO_LOGIN}</Text>
                      </Pressable>
                    </View>
                  </>
                ) : (
                  <>
                    {/* Success icon */}
                    <View style={styles.iconRing}>
                      <LinearGradient
                        colors={['#22C55E', '#10B981']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.iconGradient}
                      >
                        <Text style={styles.checkmark}>✓</Text>
                      </LinearGradient>
                    </View>

                    <Text style={styles.successTitle}>{STRINGS.RESET_LINK_SENT}</Text>
                    <Text style={styles.successMessage}>
                      {STRINGS.RESET_LINK_SENT_MESSAGE}
                    </Text>

                    <View style={styles.successActions}>
                      <Button
                        title={STRINGS.BACK_TO_LOGIN}
                        onPress={handleBackToLogin}
                      />
                    </View>
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
  screen: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  iconRing: {
    marginBottom: 20,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 30,
    color: '#FFF',
    fontWeight: '800',
  },
  title: {
    color: '#F1F5F9',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  form: {
    width: '100%',
    gap: 14,
  },
  linkWrap: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  linkPressed: {
    opacity: 0.85,
  },
  link: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '600',
  },
  successTitle: {
    color: '#F1F5F9',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  successMessage: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  successActions: {
    width: '100%',
    marginTop: 22,
  },
});
