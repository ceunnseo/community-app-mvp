import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';
import { Post } from '../types';
import { RootStackParamList } from '../../App';
import Header from '../components/Header';

type RouteParams = RouteProp<RootStackParamList, 'CreatePost'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

const CreatePostScreen: React.FC = () => {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  
  // 수정 모드인지 확인
  const isEditMode = route.params?.mode === 'edit';
  const postId = route.params?.postId;
  
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  
  const user = auth().currentUser;

  // 수정 모드일 때 기존 게시글 데이터 불러오기
  useEffect(() => {
    if (isEditMode && postId) {
      fetchPost();
    }
  }, [isEditMode, postId]);

  const fetchPost = async () => {
    try {
      const postDoc = await firestore()
        .collection('posts')
        .doc(postId)
        .get();

      if (postDoc.exists) {
        const postData = {
          id: postDoc.id,
          ...postDoc.data(),
        } as Post;

        // 작성자 확인
        if (postData.authorId !== user?.uid) {
          Alert.alert('오류', '수정 권한이 없습니다.');
          navigation.goBack();
          return;
        }

        setContent(postData.content);
        setExistingImages(postData.imageURLs || []);
      } else {
        Alert.alert('오류', '게시글을 찾을 수 없습니다.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('게시글 로드 실패:', error);
      Alert.alert('오류', '게시글을 불러올 수 없습니다.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      const imageToRemove = existingImages[index];
      setRemovedImages([...removedImages, imageToRemove]);
    } else {
      const newImages = [...images];
      newImages.splice(index, 1);
      setImages(newImages);
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadPromises = images.map(async (imagePath, index) => {
      const filename = `posts/${user?.uid}/${Date.now()}_${index}.jpg`;
      const reference = storage().ref(filename);
      
      await reference.putFile(imagePath);
      const url = await reference.getDownloadURL();
      return url;
    });

    return Promise.all(uploadPromises);
  };

  const deleteRemovedImages = async () => {
    const deletePromises = removedImages.map(async (imageUrl) => {
      try {
        const reference = storage().refFromURL(imageUrl);
        await reference.delete();
      } catch (error) {
        console.error('이미지 삭제 실패:', error);
      }
    });

    await Promise.all(deletePromises);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }

    if (!user) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }

    setSubmitting(true);

    try {
      // 새 이미지 업로드
      const newImageUrls = await uploadImages();
      
      if (isEditMode) {
        // 수정 모드: 삭제된 이미지 제거
        await deleteRemovedImages();
        
        // 최종 이미지 URL 리스트
        const finalImageUrls = [
          ...existingImages.filter(url => !removedImages.includes(url)),
          ...newImageUrls,
        ];

        // 게시글 업데이트
        await firestore()
          .collection('posts')
          .doc(postId)
          .update({
            content: content.trim(),
            imageURLs: finalImageUrls,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });

        Alert.alert('성공', '게시글이 수정되었습니다.', [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        // 생성 모드: 새 게시글 생성
        const postData = {
          authorId: user.uid,
          authorName: user.displayName || '익명',
          authorPhotoURL: user.photoURL || null,
          content: content.trim(),
          imageURLs: newImageUrls,
          likeCount: 0,
          commentCount: 0,
          createdAt: firestore.FieldValue.serverTimestamp(),
        };

        await firestore().collection('posts').add(postData);

        Alert.alert('성공', '게시글이 작성되었습니다.', [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      console.error(`게시글 ${isEditMode ? '수정' : '작성'} 실패:`, error);
      Alert.alert('오류', `게시글 ${isEditMode ? '수정' : '작성'}에 실패했습니다.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  const displayedExistingImages = existingImages.filter(url => !removedImages.includes(url));

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header 
        title={isEditMode ? "게시글 수정" : "새 게시글"} 
        leftIcon="less-than"
        onLeftPress={() => navigation.goBack()} 
        rightIcon="circle-check" 
        onRightPress={handleSubmit}
        rightDisabled={submitting || !content.trim()}
        disableTopInset
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <TextInput
            style={styles.contentInput}
            placeholder="내용을 입력하세요..."
            placeholderTextColor="#999"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            autoFocus={!isEditMode}
            editable={!submitting}
          />
        </View>
      </ScrollView>

      {submitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>
            {isEditMode ? '수정 중...' : '게시 중...'}
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 15,
  },
  contentInput: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    minHeight: 200,
    marginBottom: 20,
  },
  imageSection: {
    marginTop: 10,
  },
  imageWrapper: {
    marginRight: 10,
    position: 'relative',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4285F4',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  addImageText: {
    marginTop: 5,
    fontSize: 12,
    color: '#4285F4',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default CreatePostScreen;