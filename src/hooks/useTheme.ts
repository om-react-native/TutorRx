import { useThemeStore } from '@store/themeStore';
import { Colors } from '@theme/colors';
import type { ColorScheme, ColorPalette } from '@theme/colors';

export const useTheme = () => {
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const setTheme = useThemeStore((state) => state.setTheme);

  const colors: ColorPalette = Colors[colorScheme];

  return {
    colors,
    colorScheme,
    isDark: colorScheme === 'dark',
    isLight: colorScheme === 'light',
    toggleTheme,
    setTheme,
  };
};

