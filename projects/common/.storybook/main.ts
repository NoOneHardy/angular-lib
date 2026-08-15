import type { StorybookConfig } from '@storybook/angular-vite'

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.ts',
    '../stories/**/*.mdx',
    '../stories/**/*.stories.ts'
  ],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs'
  ],
  framework: {
    name: '@storybook/angular-vite',
    options: {
      compodoc: true,
      compodocArgs: [
        '-e',
        'json',
        '-d',
        'projects/common'
      ]
    }
  },
  features: {
    angularFilterNonInputControls: true
  }
}
export default config
