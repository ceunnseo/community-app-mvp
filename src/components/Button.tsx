import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  label: string; //버튼 텍스트
  onPress: () => void | Promise<void>; //버튼 클릭 시 실행될 함수
  loading?: boolean; //로딩 여부
  disabled?: boolean; //버튼 비활성화 여부
  backgroundColor?: string; //배경 색상 커스텀
  style?: ViewStyle; //컨테이너 스타일
  labelStyle?: TextStyle; //텍스트 스타일 커스터마이징
}

const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  backgroundColor = '#4285F4',
  style,
  labelStyle,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor, opacity: disabled ? 0.6 : 1 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Button;
