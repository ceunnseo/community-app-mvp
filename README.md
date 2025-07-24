
## 주요 특징

| 구분                            | 설명                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| **공통 UI 컴포넌트**                | `Button`, `Header` 등 반복되는 UI를 모듈화하여 일관된 디자인·코드 재사용 실현                  |
| **훅**                  | Google Sign‑In + Firebase Auth 로직을 하나의 훅으로 캡슐화하여, 화면에서는 함수 호출만으로 로그인/로그아웃·로딩·에러 상태 사용 |
| **TypeScript 전면 도입**          | 명시적 타입, 타입 가드로 런타임 오류 사전 방지                                                          |
| **폴더별 책임 분리**                 | `screens/`, `components/`, `hooks/` 로 역할을 세분화                           |
| **ESLint + Prettier** | 커밋 단계에서 코드 스타일과 린트 자동 검증                                                             |

---

## 🗂️ 폴더 구조

```text
├─ App.tsx              # 최상위 네비게이션 & Provider
├─ components/          # 공통 UI
│  └─ Button.tsx
│  └─ Header.tsx
├─ hooks/
│  └─ useAuth.ts        # 인증 전용 훅
└─ screens/             #스크린
│   ├─ LoginScreen.tsx
│   └─ HomeScreen.tsx
├─ types/                #firestore에서 사용하는 주요 타입들
│    └─ HomeScreen.tsx
└─ utils/                #firestore 리스너
    └─ listenerManager.ts
```

---

## 🧩 공통 UI 컴포넌트 설계

### 1) Button

- **변형(variant)**: `primary`, `secondary`, `danger`를 prop 하나로 선택
- **접근성**: `accessibilityRole="button"`, `testID` 기본 제공
- **로딩 상태**: `isLoading` prop → 내부에서 `ActivityIndicator`로 전환

```tsx
<Button label="Google로 로그인" onPress={signIn} variant="primary" />
```


---

## 🔐 `useAuth` 훅 구조

| 반환 값       | 타입                               | 용도                                    |
| ---------- | -------------------------------- | ------------------------------------- |
| `user`     | `FirebaseAuthTypes.User \| null` | 현재 로그인 사용자 정보                         |
| `loading`  | `boolean`                        | 로그인/로그아웃 진행 여부                        |
| `error`    | `AuthError \| null`              | 타입 가드가 적용된 오류 객체                      |
| `signIn()` | `() => Promise<void>`            | Google Sign‑In → Firebase Auth 콜체인 실행 |
| `logout()` | `() => Promise<void>`            | Google·Firebase 세션 동시 정리              |

> **타입 가드**로 오류를 `google / firebase / unknown`으로 구분하여, 화면에서는 코드별 메시지 매핑만 담당합니다.

```tsx
const { signIn, loading, error } = useAuth();
```

---

## 🚀 실행 방법

1. **의존성 설치**
   ```bash
   yarn install
   cd ios && pod install   # iOS
   ```
2. **Google 서비스 설정**
   - `google-services.json` / `GoogleService-Info.plist` 추가
   - `GoogleSignin.configure({ webClientId: '...oauth...' })` (App 시작 시 1회)
3. **시뮬레이터/디바이스 실행**
   ```bash
   yarn android    # 또는
   yarn ios
   ```

---

## 🛠️ 기술 스택 & 도구

- **React Native CLI 0.80.1**
- **TypeScript 5.0.4**
- **Firebase Auth & Firestore**
- **React Navigation 7**
- **ESLint + Prettier**

> **브랜치 전략**  `main` (배포) ← `dev` (통합) ← feature/hotfix 브랜치
