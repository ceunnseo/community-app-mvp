import React, { useEffect, useState , useLayoutEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  FlatList,
  ActionSheetIOS,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Post, Comment } from '../types';
import { RootStackParamList } from '../../App';
import Header from '../components/Header';

type RouteParams = RouteProp<RootStackParamList, 'PostDetail'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

const PostDetailScreen: React.FC = () => {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const { postId } = route.params;
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  const user = auth().currentUser;

  useLayoutEffect(() => {
  navigation.setOptions({
    headerRight: () => (
      <TouchableOpacity
        style={styles.headerButton}
        onPress={handleMenuPress}
      >
        <Icon name="ellipsis-horizontal" size={24} color="#000" />
      </TouchableOpacity>
    ),
  });
}, [navigation, post, user]);
const handleMenuPress = () => {
    if (!post) return;

    const isMyPost = user?.uid === post.authorId;

    if (Platform.OS === 'ios') {
      // iOS ActionSheet
      const options = isMyPost
        ? ['수정', '삭제', '취소']
        : ['링크 복사', '취소'];
      const destructiveButtonIndex = isMyPost ? 1 : undefined;
      const cancelButtonIndex = isMyPost ? 2 : 1;

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
        },
        (buttonIndex) => {
          if (isMyPost) {
            if (buttonIndex === 0) handleEdit();
            else if (buttonIndex === 1) handleDelete();
          } else {
            if (buttonIndex === 0) handleShare();
          }
        }
      );
    } else {
      // Android Alert
      if (isMyPost) {
        Alert.alert(
          '게시글 관리',
          '',
          [
            { text: '수정', onPress: handleEdit },
            { text: '삭제', onPress: handleDelete, style: 'destructive' },
            { text: '취소', style: 'cancel' },
          ],
          { cancelable: true }
        );
      } else {
        Alert.alert(
          '게시글 옵션',
          '',
          [
            { text: '링크 복사', onPress: handleShare },
            { text: '취소', style: 'cancel' },
          ],
          { cancelable: true }
        );
      }
    }
  };

  const handleEdit = () => {
  if (!post) return;
  
  // CreatePost 화면으로 이동하면서 수정 모드와 postId 전달
  navigation.navigate('CreatePost', { 
    mode: 'edit', 
    postId: post.id 
  });
};

  const handleDelete = () => {
    Alert.alert(
      '게시글 삭제',
      '정말로 이 게시글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              // 게시글 삭제
              await firestore()
                .collection('posts')
                .doc(postId)
                .delete();
              
              // 관련 댓글들도 삭제 (옵션)
              const commentsSnapshot = await firestore()
                .collection('comments')
                .where('postId', '==', postId)
                .get();
              
              const batch = firestore().batch();
              commentsSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
              });
              await batch.commit();
              
              Alert.alert('삭제 완료', '게시글이 삭제되었습니다.');
              navigation.goBack();
            } catch (error) {
              console.error('삭제 실패:', error);
              Alert.alert('오류', '게시글 삭제에 실패했습니다.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleShare = () => {
    Alert.alert('준비 중', '공유 기능은 준비 중입니다.');
    // TODO: 실제 공유 기능 구현
  };

  // 게시글 실시간 구독
  useEffect(() => {
    console.log('게시글 구독 시작, postId:', postId);
    
    const unsubscribe = firestore()
      .collection('posts')
      .doc(postId)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            setPost({
              id: doc.id,
              ...doc.data(),
            } as Post);
            console.log('게시글 업데이트됨');
          } else {
            Alert.alert('오류', '게시글을 찾을 수 없습니다.');
            navigation.goBack();
          }
          setLoading(false);
        },
        (error) => {
          console.error('게시글 구독 실패:', error);
          Alert.alert('오류', '게시글을 불러올 수 없습니다.');
          setLoading(false);
        }
      );

    return () => {
      console.log('게시글 구독 해제');
      unsubscribe();
    };
  }, [postId, navigation]);

  // 댓글 실시간 구독
  useEffect(() => {
    console.log('댓글 구독 시작, postId:', postId);
    
    const unsubscribe = firestore()
      .collection('comments')
      .where('postId', '==', postId)
      .onSnapshot(
        snapshot => {
          console.log('댓글 스냅샷 받음:', snapshot.size);
          const fetchedComments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Comment[];
          
          // 클라이언트에서 정렬
          fetchedComments.sort((a, b) => {
            const timeA = a.createdAt?.toMillis() || 0;
            const timeB = b.createdAt?.toMillis() || 0;
            return timeB - timeA; // 최신순
          });
          
          setComments(fetchedComments);
          
          // 댓글 수 업데이트
          if (post) {
            firestore()
              .collection('posts')
              .doc(postId)
              .update({ commentCount: fetchedComments.length })
              .catch(console.error);
          }
        },
        error => {
          console.error('댓글 구독 실패:', error);
        }
      );

    return () => {
      console.log('댓글 구독 해제');
      unsubscribe();
    };
  }, [postId, post]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return format(date, 'M월 d일 a h:mm', { locale: ko });
  };



  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      Alert.alert('알림', '댓글 내용을 입력해주세요.');
      return;
    }

    if (!user) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }

    setSubmitting(true);

    try {
      await firestore().collection('comments').add({
        postId,
        authorId: user.uid,
        authorName: user.displayName || '익명',
        authorPhotoURL: user.photoURL || null,
        content: commentText.trim(),
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      setCommentText('');
      console.log('✅ 댓글 작성 성공');
    } catch (error) {
      console.error('❌ 댓글 작성 실패:', error);
      Alert.alert('오류', '댓글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        {item.authorPhotoURL ? (
          <Image source={{ uri: item.authorPhotoURL }} style={styles.commentAuthorPhoto} />
        ) : (
          <View style={styles.commentAuthorPhotoPlaceholder}>
            <Icon name="person" size={16} color="#999" />
          </View>
        )}
        <View style={styles.commentHeaderText}>
          <Text style={styles.commentAuthorName}>{item.authorName}</Text>
          <Text style={styles.commentDate}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
      <Text style={styles.commentContent}>{item.content}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>게시글을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header title = "게시글" leftIcon = {'arrow-left'} onLeftPress = {() => navigation.goBack()} rightIcon = {'ellipsis-horizontal'} onRightPress={handleMenuPress}/>
        
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={item => item.id!}
        ListHeaderComponent={() => (
          <>
            {/* 게시글 내용 */}
            <View style={styles.postContainer}>
              <View style={styles.postHeader}>
                {post.authorPhotoURL ? (
                  <Image source={{ uri: post.authorPhotoURL }} style={styles.authorPhoto} />
                ) : (
                  <View style={styles.authorPhotoPlaceholder}>
                    <Icon name="person" size={24} color="#999" />
                  </View>
                )}
                <View style={styles.postHeaderText}>
                  <Text style={styles.authorName}>{post.authorName}</Text>
                  <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
                </View>
              </View>

              <Text style={styles.postContent}>{post.content}</Text>

              {post.imageURLs && post.imageURLs.length > 0 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.imageContainer}
                >
                  {post.imageURLs.map((url, index) => (
                    <Image 
                      key={index}
                      source={{ uri: url }} 
                      style={styles.postImage} 
                    />
                  ))}
                </ScrollView>
              )}

              <View style={styles.postStats}>
                <Icon name="chatbubble-outline" size={16} color="#666" />
                <Text style={styles.statText}>{comments.length}개의 댓글</Text>
              </View>
            </View>

            {/* 댓글 헤더 */}
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>댓글</Text>
            </View>
          </>
        )}
        contentContainerStyle={styles.listContent}
      />

      {/* 댓글 입력 */}
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="댓글을 입력하세요..."
          placeholderTextColor="#999"
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={200}
          editable={!submitting}
        />
        <TouchableOpacity 
          style={[
            styles.commentSubmitButton,
            (!commentText.trim() || submitting) && styles.commentSubmitButtonDisabled
          ]}
          onPress={handleSubmitComment}
          disabled={!commentText.trim() || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    paddingBottom: 20,
  },
  postContainer: {
    backgroundColor: '#fff',
    padding: 15,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  authorPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  authorPhotoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  postHeaderText: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  postDate: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 15,
  },
  imageContainer: {
    marginBottom: 15,
  },
  postImage: {
    width: 300,
    height: 300,
    borderRadius: 8,
    marginRight: 10,
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  commentsHeader: {
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  commentItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthorPhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  commentAuthorPhotoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  commentHeaderText: {
    flex: 1,
  },
  commentAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  commentDate: {
    fontSize: 12,
    color: '#999',
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginLeft: 40,
  },
  commentInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
    color: '#333',
  },
  commentSubmitButton: {
    backgroundColor: '#4285F4',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  commentSubmitButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default PostDetailScreen;