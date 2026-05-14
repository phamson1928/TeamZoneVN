import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAlert } from '../components/AlertProvider';
import { Container } from '../components/Container';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { FadeInView } from '../components/AnimatedTransition';
import { theme } from '../theme';
import { apiClient } from '../api/client';
import { STRINGS } from '../constants/strings';
import { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen = ({ navigation, route }: Props) => {
  const token = route.params.token;

  const { showAlert } = useAlert();

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!token) {
      await showAlert({ title: STRINGS.ERROR_TITLE, message: STRINGS.INVALID_RESET_TOKEN, variant: 'error' });
      return;
    }

    if (!newPassword || !confirmNewPassword) {
      await showAlert({ title: STRINGS.ERROR_TITLE, message: STRINGS.REQUIRED_FIELD, variant: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      await showAlert({ title: STRINGS.ERROR_TITLE, message: STRINGS.SHORT_PASSWORD, variant: 'error' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      await showAlert({ title: STRINGS.ERROR_TITLE, message: STRINGS.PASSWORD_MISMATCH, variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword,
      });

      setIsSuccess(true);
    } catch (error: any) {
      let message: string =
        error.response?.data?.message || error.message || STRINGS.API_UNREACHABLE_HINT;
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        message = STRINGS.API_UNREACHABLE_HINT;
      }
      await showAlert({ title: STRINGS.ERROR_TITLE, message: Array.isArray(message) ? message[0] : message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formCard}>
            <FadeInView direction="down" duration={600}>
              {!isSuccess ? (
                <View>
                  <Text style={styles.title}>{STRINGS.RESET_PASSWORD_TITLE}</Text>
                  <Text style={styles.subtitle}>{STRINGS.RESET_PASSWORD_SUBTITLE}</Text>

                  <Input
                    label={STRINGS.NEW_PASSWORD_LABEL}
                    placeholder={STRINGS.NEW_PASSWORD_PLACEHOLDER}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    style={styles.input}
                  />

                  <Input
                    label={STRINGS.CONFIRM_NEW_PASSWORD_LABEL}
                    placeholder={STRINGS.CONFIRM_NEW_PASSWORD_PLACEHOLDER}
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                    secureTextEntry
                    style={styles.input}
                  />

                  <Text style={styles.hint}>{STRINGS.PASSWORD_MIN_HINT}</Text>

                  <Button
                    title={STRINGS.RESET_PASSWORD_BUTTON}
                    onPress={handleResetPassword}
                    loading={loading}
                    variant="solid"
                    style={styles.resetButton}
                    size="md"
                  />
                </View>
              ) : (
                <View>
                  <Text style={styles.title}>{STRINGS.RESET_PASSWORD_SUCCESS}</Text>
                  <Text style={styles.subtitle}>
                    {STRINGS.RESET_PASSWORD_SUCCESS_MESSAGE}
                  </Text>

                  <Button
                    title={STRINGS.BACK_TO_LOGIN}
                    onPress={() => navigation.navigate('Login')}
                    variant="solid"
                    style={styles.resetButton}
                    size="md"
                  />
                </View>
              )}
            </FadeInView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },
  input: {},
  hint: {
    marginTop: -8,
    marginBottom: 16,
    fontSize: 12,
    color: '#64748B',
  },
  resetButton: {},
});
