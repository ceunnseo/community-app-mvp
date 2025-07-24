import { useState, useEffect, useCallback } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { clearAllListeners } from '../utils/listenerManager'; 

/* ───────── 타입 ───────── */
export interface AuthContext {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  error: AuthError | null;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

type GoogleErrorCode = (typeof statusCodes)[keyof typeof statusCodes];
type FirebaseErrorCode = FirebaseAuthTypes.NativeFirebaseAuthError['code'];

export type AuthError =
  | { provider: 'google'; code: GoogleErrorCode }
  | { provider: 'firebase'; code: FirebaseErrorCode }
  | { provider: 'unknown'; message: string };

/* ───────── 타입 가드 ───────── */
const isGoogleError = (e: unknown): e is { code: GoogleErrorCode } =>
  typeof e === 'object' &&
  e !== null &&
  'code' in e &&
  Object.values(statusCodes).includes((e as any).code);

const isFirebaseError = (e: unknown): e is FirebaseAuthTypes.NativeFirebaseAuthError =>
  typeof e === 'object' &&
  e !== null &&
  'code' in e &&
  String((e as any).code).startsWith('auth/');

const toAuthError = (e: unknown): AuthError =>
  isGoogleError(e)
    ? { provider: 'google', code: e.code }
    : isFirebaseError(e)
    ? { provider: 'firebase', code: e.code }
    : { provider: 'unknown', message: (e as Error)?.message ?? String(e) };

/* ───────── 훅 구현 ───────── */
export const useAuth = (): AuthContext => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  /* Firebase 유저 변화 감지 */
  useEffect(() => auth().onAuthStateChanged(setUser), []);

  /* Google + Firebase 로그인 */
  const signIn = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await GoogleSignin.signOut(); // 기존 세션 제거
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const userInfo = await GoogleSignin.signIn(); //구글 로그인
      const googleCredential = auth.GoogleAuthProvider.credential(userInfo.data?.idToken); //firebase 인증
      await auth().signInWithCredential(googleCredential);
    } catch (e) {
      setError(toAuthError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  /* 로그아웃 */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      clearAllListeners();
      await GoogleSignin.signOut();
      await auth().signOut();
    } catch (e) {
      setError(toAuthError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  return { user, loading, error, signIn, logout };
};
