module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    '@babel/plugin-transform-export-namespace-from',
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@navigation': './src/navigation',
          '@services': './src/services',
          '@utils': './src/utils',
          '@types': './src/types',
          '@hooks': './src/hooks',
          '@store': './src/store',
          '@theme': './src/theme',
          '@assets': './src/assets',
          '@constants': './src/constants',
        },
      },
    ],
    // 'react-native-reanimated/plugin', // Uncomment when using reanimated
  ],
};
