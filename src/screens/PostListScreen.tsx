import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { addListener } from '../utils/listenerManager';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Post } from '../types';
import { RootStackParamList } from '../../App';
import Header from '../components/Header';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const PostListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Firestore에서 게시글 가져오기
  const fetchPosts = async () => {
    try {
      const snapshot = await firestore()
        .collection('posts')
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();

      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];

      setPosts(fetchedPosts);
    } catch (error) {
      console.error('게시글 로드 실패:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 실시간 업데이트 구독
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('posts')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .onSnapshot(
        snapshot => {
          const updatedPosts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Post[];
          setPosts(updatedPosts);
          setLoading(false);
        },
        error => {
          console.error('실시간 업데이트 실패:', error);
          setLoading(false);
        }
      );
      addListener(unsubscribe);
    return () => unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return format(date, 'M월 d일 a h:mm', { locale: ko });
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postContainer}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id! })}
    >
      <View style={styles.postHeader}>
        {item.authorPhotoURL ? (
          <Image source={{ uri: item.authorPhotoURL }} style={styles.authorPhoto} />
        ) : (
          <View style={styles.authorPhotoPlaceholder}>
            <FontAwesome6 name="user" size={20} color="#999" />
          </View>
        )}
        <View style={styles.postHeaderText}>
          <Text style={styles.authorName}>{item.authorName}</Text>
          <Text style={styles.postDate}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>

      <Text style={styles.postContent} numberOfLines={3}>
        {item.content}
      </Text>

      {item.imageURLs && item.imageURLs.length > 0 && (
        <Image source={{ uri: item.imageURLs[0] }} style={styles.postImage} />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title = "커뮤니티" rightIcon = {'pen-to-square'} onRightPress={() => navigation.navigate('CreatePost')}/>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id!}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="file-text" size={48} color="#ccc" />
            <Text style={styles.emptyText}>아직 게시글이 없습니다</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('CreatePost')}
            >
              <Text style={styles.emptyButtonText}>첫 게시글 작성하기</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  createButton: {
    padding: 8,
  },
  listContent: {
    paddingVertical: 10,
  },
  postContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  authorPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  authorPhotoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
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
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  postContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  postFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerButtonText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PostListScreen;