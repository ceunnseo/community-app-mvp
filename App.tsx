import React, { useEffect } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth'; // 만약 Firebase Auth 쓰는 경우
import { GoogleSignin } from '@react-native-google-signin/google-signin';

function App() {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '618186988259-5elbgdr0b178if9nmhafa24fk66dhadu.apps.googleusercontent.com', // Firebase 콘솔에서 복사 (iOS용 아님!)
      iosClientId: '618186988259-p8qtl1lhgjhiq8utmpfoqtrj24jb62al.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // 로그인
      const userInfo = await GoogleSignin.signIn();
      console.log('🧪 전체 userInfo:', userInfo);
      console.log('🧪 userInfo.data:', userInfo.data.idToken);
      console.log('🧪 idToken:', userInfo.idToken);
      const googleCredential = auth.GoogleAuthProvider.credential(userInfo.data.idToken);
      await auth().signInWithCredential(googleCredential);
      console.log('✅ 로그인 성공');
    } catch (error) {
      console.log('❌ 로그인 실패:', error);
      console.log('❌ 로그인 실패 코드:', error.code);
      console.log('❌ 로그인 실패 메세지:', error.message);
      console.log('❌ 로그인 실패 전체:', JSON.stringify(error));
      console.error('❌ 로그인 실패:', error.code, error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Google 로그인 테스트!</Text>
      <Button title="Google로 로그인" onPress={signInWithGoogle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    color : '#ffffff',
  },
});

export default App;
