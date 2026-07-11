import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, TOUCH_MIN } from '../theme/spacing';

export default function ThemeToggle() {
  const { theme, toggleTheme, colors } = useTheme();
  const isDark = theme === 'dark';

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={styles.touchable}
      activeOpacity={0.7}
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      accessibilityRole="switch"
    >
      <View style={[styles.track, { backgroundColor: colors.bgTertiary, borderColor: colors.glassBorder }]}>
        <View style={[styles.thumb, isDark ? styles.thumbDark : styles.thumbLight, { backgroundColor: colors.accentPrimary }]}>
          <Feather name={isDark ? 'moon' : 'sun'} size={14} color="white" />
        </View>
        <View style={styles.icons}>
          <Feather name="moon" size={12} color={isDark ? 'transparent' : colors.textMuted} />
          <Feather name="sun" size={12} color={isDark ? colors.textMuted : 'transparent'} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    minHeight: TOUCH_MIN,
    minWidth: TOUCH_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    width: 56,
    height: 32,
    borderRadius: radius.full,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 1,
  },
  thumbDark: { left: 3 },
  thumbLight: { right: 3 },
  icons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
});
