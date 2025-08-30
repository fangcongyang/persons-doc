import path from 'path'
import Inspect from 'vite-plugin-inspect'
import UnoCSS from 'unocss/vite'
import mkcert from 'vite-plugin-mkcert'
import glob from 'fast-glob'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { loadEnv } from 'vitepress'
import { groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import {
  docPackage,
  getPackageDependencies,
  projRoot,
} from '../../build-utils'
import { MarkdownTransform } from '../plugins/markdown-transform'
import type { Plugin, UserConfig } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'

type ViteConfig = Required<UserConfig>['vite']

export const getViteConfig = ({ mode }: { mode: string }): ViteConfig => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['legacy-js-api'],
        },
      },
    },
    server: {
      host: true,
      fs: {
        allow: [projRoot],
      },
    },
    resolve: {
      alias: [
        {
          find: '~/',
          replacement: `${path.resolve(__dirname, '../vitepress')}/`,
        }
      ]
    },
    plugins: [
      vueJsx(),

      // https://github.com/antfu/unplugin-vue-components
      Components({
        dirs: ['.vitepress/vitepress/components'],

        allowOverrides: true,

        // custom resolvers
        resolvers: [
          // auto import icons
          // https://github.com/antfu/unplugin-icons
          IconsResolver(),
        ],

        // allow auto import and register components used in markdown
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      }),

      // https://github.com/antfu/unplugin-icons
      Icons({
        autoInstall: true,
      }),

      UnoCSS({
        inspector: false,
      }),

      MarkdownTransform(),
      Inspect(),
      groupIconVitePlugin(),
      llmstxt({
        workDir: 'zh',
        ignoreFiles: ['index.md']
      }),
      env.HTTPS ? (mkcert() as Plugin) : undefined,
    ],
    // 确保Element Plus及其图标被正确处理
    optimizeDeps: {
      include: ['element-plus', '@element-plus/icons-vue']
    }
  }
}
