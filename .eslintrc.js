module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/semi': ['error', 'never'],
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        accessibility: 'explicit',
        overrides: {
          accessors: 'explicit',
          constructors: 'off',
          methods: 'explicit',
          parameterProperties: 'explicit',
          properties: 'explicit',
        },
      },
    ],
    'max-len': [
      'error',
      {
        code: 80,
        ignoreComments: true,
        tabWidth: 2,
      },
    ],
    'max-lines-per-function': ['error', 40],
    'no-param-reassign': 1,
    'no-plusplus': 0,
    'no-unused-vars': 0,
    'spaced-comment': [
      'error',
      'always',
      {
        markers: ['!', '?', ' //', 'todo', '*'],
      },
    ],
    'block-spacing': ['warn', 'always'],
  },
}
