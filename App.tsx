import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// 화면 컴포넌트들
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import LoadingScreen from './src/screens/LoadingScreen';

// 네비게이션 타입 정의
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    // Google Sign-In 설정
    GoogleSignin.configure({
      webClientId: '618186988259-5elbgdr0b178if9nmhafa24fk66dhadu.apps.googleusercontent.com',
      iosClientId: '618186988259-p8qtl1lhgjhiq8utmpfoqtrj24jb62al.apps.googleusercontent.com',
      offlineAccess: true,
    });

    // 인증 상태 변화 감지
    const subscriber = auth().onAuthStateChanged((user) => {
      console.log('Auth state changed:', user?.email || 'No user');
      setUser(user);
      setIsReady(true);
    });

    // 초기 상태 확인
    setTimeout(() => {
      if (!isReady) {
        console.log('Forcing ready state');
        setIsReady(true);
      }
    }, 2000);

    return () => subscriber();
  }, []);

   if (!isReady) return <LoadingScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          gestureEnabled: false 
        }}
      >
        {user ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;