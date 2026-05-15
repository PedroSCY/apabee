import { config as baseConfig } from '@repo/eslint-config/base'

export default [
  ...baseConfig,
  {
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
]
