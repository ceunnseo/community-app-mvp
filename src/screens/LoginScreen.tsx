import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import Button from '../components/Button';
import { useAuth, AuthError } from '../hooks/useAuth';
import { statusCodes } from '@react-native-google-signin/google-signin';

type LoginScreenProps = StackScreenProps<RootStackParamList, 'Login'>;

const messageOf = (err: AuthError): string => {
  if (err.provider === 'google') {
    switch (err.code) {
      case statusCodes.SIGN_IN_CANCELLED:
        return '로그인이 취소되었습니다.';
      case statusCodes.IN_PROGRESS:
        return '이미 로그인이 진행 중입니다.';
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        return 'Play Services를 사용할 수 없습니다.';
      default:
        return 'Google 로그인 중 오류가 발생했습니다.';
    }
  }
  if (err.provider === 'firebase') {
    if (err.code === 'auth/network-request-failed') {
      return '네트워크 오류가 발생했습니다.';
    }
    return 'Firebase 인증 중 오류가 발생했습니다.';
  }
  return err.message || '알 수 없는 오류가 발생했습니다.';
};

const LoginScreen: React.FC<LoginScreenProps> = () => {
  const { signIn, loading, error } = useAuth();

  useEffect(() => {
    if (error) {
      Alert.alert('오류', messageOf(error));
    }
  }, [error]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>환영합니다</Text>
      <Text style={styles.subtitle}>Google 계정으로 로그인하세요</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button
          label="Google로 로그인"
          onPress={signIn}
          backgroundColor="#4285F4"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 50,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#4285F4',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
export default LoginScreen;