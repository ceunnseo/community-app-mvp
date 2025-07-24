import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

interface HeaderProps {
  title: string;
  leftIcon?: string;
  onLeftPress?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  barStyle?: 'light-content' | 'dark-content';
  backgroundColor?: string;
  textColor?: string;
  disableTopInset?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  barStyle = 'dark-content',
  backgroundColor = '#fff',
  textColor = '#333',
  disableTopInset = false,
}) => {
  const insets = useSafeAreaInsets();
  const topPadding = disableTopInset ? 12 : insets.top;
  const baseBarHeight = 56;

  return (
    <>
      <StatusBar
        barStyle={barStyle}
        backgroundColor={backgroundColor}
        translucent={Platform.OS === 'android'}
      />
      <View
        style={[
          styles.container,
          {
            backgroundColor,
            paddingTop: topPadding,
            minHeight: baseBarHeight + topPadding,
          },
        ]}
      >
        {leftIcon && (
          <TouchableOpacity
            onPress={onLeftPress}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="뒤로가기"
          >
            <FontAwesome6 name={leftIcon} size={24} color={textColor} solid />
          </TouchableOpacity>
        )}

        <Text style={[styles.title, { color: textColor }]}>{title}</Text>

        {rightIcon ? (
          <TouchableOpacity
            onPress={onRightPress}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel={`${title} 우측 버튼`}
          >
            <FontAwesome6 name={rightIcon} size={24} color={textColor} solid />
            
          </TouchableOpacity>
        ) : (
          /* 아이콘이 없더라도 중앙 정렬 유지를 위해 비어 있는 View */
          <View style={styles.iconPlaceholder} />
        )}
      </View>
    </>
  );
};

export default memo(Header);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  iconButton: {
    padding: 8,
  },
  iconPlaceholder: {
    width: 40, // iconButton width와 동일하게 맞춰 중앙 정렬
  },
});
