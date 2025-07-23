import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PostDetailScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>게시글 상세 화면 (구현 예정)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PostDetailScreen;