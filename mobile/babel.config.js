module.exports = function (api) {
  api.cache(true)
  const isTest = process.env.NODE_ENV === 'test' || process.env.BABEL_ENV === 'test'
  return {
    presets: ['babel-preset-expo', ...(isTest ? [] : ['nativewind/babel'])],
    plugins: [
      // Path aliases - must match tsconfig.json paths
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@features': './src/features',
            '@hooks': './src/hooks',
            '@services': './src/services',
            '@utils': './src/utils',
            '@context': './src/context',
            '@navigation': './src/navigation',
            '@types': './src/types',
            '@shared': './src/shared',
          },
        },
      ],
      // Reanimated must be last
      'react-native-reanimated/plugin',
    ],
  }
}
