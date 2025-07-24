import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Header from '../components/Header';
import Button from '../components/Button';
import { clearAllListeners } from '../utils/listenerManager';
import { useAuth } from '../hooks/useAuth';


const ProfileScreen: React.FC = () => {
  const user = auth().currentUser;
  const { logout } = useAuth();

  const confirmLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '로그아웃', style: 'destructive', onPress: handleLogout },
      ],
      { cancelable: true },
    );
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
      Alert.alert('로그아웃 실패', '로그아웃 중 오류가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Header title = "프로필"/>

      <View style={styles.profileSection}>
        {user?.photoURL ? (
          <Image 
            source={{ uri: user.photoURL }} 
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.profileImageText}>
              {user?.displayName?.[0] || '?'}
            </Text>
          </View>
        )}
        
        <Text style={styles.userName}>{user?.displayName || '사용자'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.menuSection}>
        <Button
          label="로그아웃"
          onPress={confirmLogout}
          backgroundColor="#DB4437"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImageText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  menuSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DB4437',
  },
  logoutButtonText: {
    color: '#DB4437',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;