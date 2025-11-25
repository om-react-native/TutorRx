export const Colors = {
  light: {
    // Primary colors
    primary: '#4A90E2',
    primaryDark: '#357ABD',
    primaryLight: '#6BA3E8',
    
    // Background colors - Light blue to light purple gradient
    background: '#D6E9F5',
    backgroundGradient: ['#D6E9F5', '#E8F4FA'],
    backgroundSecondary: 'rgba(255, 255, 255, 0.9)',
    backgroundTertiary: '#E8ECF1',
    
    // Text colors
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textInverse: '#FFFFFF',
    
    // Accent colors
    accent: '#10B981',
    accentSecondary: '#F59E0B',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    info: '#3B82F6',
    
    // Border colors
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    borderDark: '#D1D5DB',
    
    // Glassmorphism colors - Frosted glass effect for light mode
    glassBackground: 'rgba(255, 255, 255, 0.4)',
    glassBorder: 'rgba(255, 255, 255, 0.6)',
    glassPanelBackground: 'rgba(255, 255, 255, 0.3)',
    glassShadow: 'rgba(0, 0, 0, 0.1)',
    
    // Overlay colors
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.2)',
    
    // Card colors
    cardBackground: '#FFFFFF',
    cardShadow: 'rgba(0, 0, 0, 0.08)',
    
    // Premium colors
    premium: '#FFD700',
    premiumGradient: ['#FFD700', '#FFA500'],
  },
  dark: {
    // Primary colors
    primary: '#5BA3F0',
    primaryDark: '#4A90E2',
    primaryLight: '#7BB5F5',
    
    // Background colors - Dark blue to black gradient
    background: '#0F1419',
    backgroundGradient: ['#1A2332', '#000000'],
    backgroundSecondary: '#1A1F2E',
    backgroundTertiary: '#252B3A',
    
    // Text colors
    text: '#FFFFFF',
    textSecondary: '#A1A8B3',
    textTertiary: '#6B7280',
    textInverse: '#1A1A1A',
    
    // Accent colors
    accent: '#10B981',
    accentSecondary: '#F59E0B',
    error: '#F87171',
    warning: '#FBBF24',
    success: '#34D399',
    info: '#60A5FA',
    
    // Border colors
    border: '#2D3748',
    borderLight: '#374151',
    borderDark: '#1F2937',
    
    // Glassmorphism colors - Frosted glass effect for dark mode
    glassBackground: 'rgba(26, 31, 46, 0.5)',
    glassBorder: 'rgba(255, 255, 255, 0.15)',
    glassPanelBackground: 'rgba(26, 31, 46, 0.6)',
    glassShadow: 'rgba(0, 0, 0, 0.4)',
    
    // Overlay colors
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.4)',
    
    // Card colors
    cardBackground: '#1A1F2E',
    cardShadow: 'rgba(0, 0, 0, 0.3)',
    
    // Premium colors
    premium: '#FFD700',
    premiumGradient: ['#FFD700', '#FFA500'],
  },
};

export type ColorScheme = keyof typeof Colors;
export type ColorPalette = typeof Colors.light;

