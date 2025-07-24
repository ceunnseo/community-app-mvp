import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { RootStackParamList } from '../../App';
import Header from '../components/Header';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const CreatePostScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const user = auth().currentUser;

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }

    if (!user) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }

    setLoading(true);

    try {
      // Firestore에 게시글 저장
      await firestore().collection('posts').add({
        authorId: user.uid,
        authorName: user.displayName || '익명',
        authorPhotoURL: user.photoURL || null,
        content: content.trim(),
        imageURLs: [],
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
        commentCount: 0,
      });

      console.log('✅ 게시글 작성 성공');
      
      // 성공 후 이전 화면으로 돌아가기
      navigation.goBack();
      
      // 약간의 지연 후 성공 메시지 표시
      setTimeout(() => {
        Alert.alert('성공', '게시글이 작성되었습니다.');
      }, 100);

    } catch (error) {
      console.error('❌ 게시글 작성 실패:', error);
      Alert.alert('오류', '게시글 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header title = "새 게시글" leftIcon = {'arrow-left'} onLeftPress = {() => navigation.goBack()} rightIcon = {'checkmark'} onRightPress={handleSubmit} disableTopInset/>
      {/*<View style={styles.header}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>새 게시글</Text>
        
        <TouchableOpacity 
          style={[
            styles.submitButton,
            (!content.trim() || loading) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!content.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[
              styles.submitText,
              (!content.trim() || loading) && styles.submitTextDisabled
            ]}>
              게시
            </Text>
          )}
        </TouchableOpacity>
      </View>*/}

      <ScrollView 
        style={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.authorInfo}>
          {user?.photoURL ? (
            <Image 
              source={{ uri: user.photoURL }} 
              style={styles.authorPhoto}
            />
          ) : (
            <View style={styles.authorPhotoPlaceholder}>
              <Text style={styles.authorPhotoText}>
                {user?.displayName?.[0] || '?'}
              </Text>
            </View>
          )}
          <Text style={styles.authorName}>{user?.displayName || '익명'}</Text>
        </View>

        <TextInput
          style={styles.textInput}
          placeholder="무슨 생각을 하고 계신가요?"
          placeholderTextColor="#999"
          value={content}
          onChangeText={setContent}
          multiline
          autoFocus
          editable={!loading}
          maxLength={500}
        />

        <Text style={styles.charCount}>
          {content.length} / 500
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    padding: 5,
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitTextDisabled: {
    color: '#999',
  },
  contentContainer: {
    flex: 1,
    padding: 15,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  authorPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  authorPhotoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  authorPhotoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    color: '#999',
    fontSize: 14,
    marginTop: 10,
  },
});

export default CreatePostScreen;