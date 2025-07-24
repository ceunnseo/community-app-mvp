import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import Button from '../components/Button';
type LoginScreenProps = StackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<LoginScreenProps> = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // 이전 로그인 세션 초기화
      await GoogleSignin.signOut();
      
      // Play Services 확인
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Google 로그인
      const userInfo = await GoogleSignin.signIn();
      console.log('✅ Google Sign-In 성공:', userInfo.data?.user?.email);
      
      // Firebase 인증
      const googleCredential = auth.GoogleAuthProvider.credential(userInfo.data?.idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      
      console.log('✅ Firebase 인증 성공:', userCredential.user.email);
      // 성공 시 자동으로 HomeScreen으로 이동됨
      
    } catch (error: any) {
      console.error('❌ 로그인 실패:', error);
      
      let errorMessage = '로그인 중 오류가 발생했습니다.';
      
      if (error.code === 'SIGN_IN_CANCELLED') {
        errorMessage = '로그인이 취소되었습니다.';
      } else if (error.code === 'IN_PROGRESS') {
        errorMessage = '이미 로그인이 진행 중입니다.';
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        errorMessage = 'Play Services를 사용할 수 없습니다.';
      }
      
      Alert.alert('로그인 실패', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>환영합니다</Text>
      <Text style={styles.subtitle}>Google 계정으로 로그인하세요</Text>

      <Button
        label="Google로 로그인"
        onPress={signInWithGoogle}
        backgroundColor="#4285F4"
      />
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