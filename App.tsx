// App.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';



// 화면 컴포넌트들
import LoginScreen from './src/screens/LoginScreen';
import PostListScreen from './src/screens/PostListScreen';
import CreatePostScreen from './src/screens/CreatePostScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoadingScreen from './src/screens/LoadingScreen';

// 타입 정의
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  CreatePost: { 
    mode?: 'create' | 'edit';  // 선택적 파라미터
    postId?: string;           // 수정 모드일 때만 필요
  };
  PostDetail: { postId: string };
};

export type MainTabParamList = {
  PostList: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// 메인 탭 네비게이터
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'PostList') {
             iconName = 'house';
          } else if (route.name === 'Profile') {
             iconName = 'user';
          } else {
            iconName = 'help';
          }

          return <FontAwesome6 name={iconName} size={size} color={color} solid />;
        },
        tabBarActiveTintColor: '#4285F4',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="PostList" 
        component={PostListScreen} 
        options={{ title: '홈' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: '프로필' }}
      />
    </Tab.Navigator>
  );
}

function App(): React.JSX.Element {
  const [initializing, setInitializing] = useState<boolean>(true);
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
      setInitializing(false);
    });

    return subscriber;
  }, []);

  if (initializing) return <LoadingScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          gestureEnabled: true,
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen 
              name="CreatePost" 
              component={CreatePostScreen}
              options={{
                headerShown: false,
                headerTitle: '새 게시글',
                headerStyle: { backgroundColor: '#fff' },
                headerTintColor: '#000',
                presentation: 'modal',
              }}
            />
            <Stack.Screen 
              name="PostDetail" 
              component={PostDetailScreen}
              options={{
                headerShown: false,
                //headerTitle: '게시글~',
                //headerStyle: { backgroundColor: '#fff' },
                //headerTintColor: '#000',
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;