module.exports = function (api) {
  api.cache(true)
  const isTest = process.env.NODE_ENV === 'test' || process.env.BABEL_ENV === 'test'
  return {
    presets: ['babel-preset-expo', ...(isTest ? [] : ['nativewind/babel'])],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './src',
            '@assets': './assets',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  }
}
