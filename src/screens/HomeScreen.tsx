import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const user = auth().currentUser;

  const handleLogout = async (): Promise<void> => {
    try {
      // Google 로그아웃
      await GoogleSignin.signOut();
      // Firebase 로그아웃
      await auth().signOut();
      console.log('✅ 로그아웃 성공');
      // 자동으로 LoginScreen으로 이동됨
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
      Alert.alert('로그아웃 실패', '로그아웃 중 오류가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        {user?.photoURL && (
          <Image 
            source={{ uri: user.photoURL }} 
            style={styles.profileImage}
          />
        )}
        <Text style={styles.welcomeText}>안녕하세요!</Text>
        <Text style={styles.userName}>{user?.displayName || '사용자'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  profileSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    color: '#333',
    marginBottom: 8,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#DB4437',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;