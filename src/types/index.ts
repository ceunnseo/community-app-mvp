import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
}

export interface Post {
  id?: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
  imageURLs: string[];
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
  commentCount: number;
}

export interface Comment {
  id?: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
}