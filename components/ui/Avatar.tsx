import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  StyleProp,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '@/store/useThemeStore';
import { BASEURL } from '@/utils/fetch';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: number;
  style?: StyleProp<ImageStyle | ViewStyle>;
}

export function Avatar({ source, name, size = 40, style }: AvatarProps) {
  const { colors, gradients } = useThemeStore();
  // Get initials from name
  const getInitials = () => {
    if (!name) return '';

    const names = name.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    return (
      names[0].charAt(0).toUpperCase() +
      names[names.length - 1].charAt(0).toUpperCase()
    );
  };

  const initials = getInitials();

  if (!source || source === 'null') {
    return (
      <LinearGradient
        colors={gradients.primary as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.avatarPlaceholder,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          style,
        ]}
      >
        <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
          {initials}
        </Text>
      </LinearGradient>
    );
  } else {
    source = source?.startsWith('file:/') ? source : `${BASEURL}${source}`;

    return (
      <Image
        source={{ uri: source }}
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: colors.border,
          },
          style as StyleProp<ImageStyle>,
        ]}
      />
    );
  }
}

const styles = StyleSheet.create({
  avatar: {
    borderWidth: 1,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: 'white',
    fontWeight: '600',
  },
});
