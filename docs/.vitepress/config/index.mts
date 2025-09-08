
import type { HeadConfig, UserConfig } from 'vitepress'

import { languages } from '../utils/lang'
import { mdPlugin } from './plugins'
import { head } from './head'
import { nav } from './nav'
import { sidebars } from './sidebars'
import { getViteConfig } from './vite'
import { vueCompiler } from './vue-compiler'

const prod = !!process.env.NETLIFY

const buildTransformers = () => {
  const transformer = () => {
    return {
      props: [],
      needRuntime: true,
    }
  }

  const transformers = {}
  const directives = [
    'infinite-scroll',
    'loading',
    'popover',
    'click-outside',
    'repeat-click',
    'trap-focus',
    'mousewheel',
    'resize',
  ]
  directives.forEach((k) => {
    transformers[k] = transformer
  })

  return transformers
}

const locales = {}
languages.forEach((lang) => {
  locales[`/${lang}`] = {
    label: lang,
    lang,
  }
})

// https://vitepress.dev/reference/site-config
const setupConfig = (configEnv) => {
    const config: UserConfig<any> = {
      title: "persons-doc",
      description: "A persons doc",
      vite: getViteConfig(configEnv),
      markdown: {
        // math: true, // 支持tex语法
        // lineNumbers: true,
        // languages: [
        //   'xml',
        //   'java',
        //   'typescript',
        //   'javascript',
        //   'rust',
        // ],
        // codeTransformers: [
        //   {
        //     postprocess(code) {
        //       return code.replace(/\[\!\!code/g, '[!code')
        //     }
        //   }
        // ],

      config: (md) => mdPlugin(md),
    // config(md) {
    //   mdPlugin(md)
      // const fence = md.renderer.rules.fence!
      // md.renderer.rules.fence = function (tokens, idx, options, env, self) {
      //   const { localeIndex = 'root' } = env
      //   const codeCopyButtonTitle = (() => {
      //     switch (localeIndex) {
      //       case 'es':
      //         return 'Copiar código'
      //       case 'fa':
      //         return 'کپی کد'
      //       case 'ko':
      //         return '코드 복사'
      //       case 'pt':
      //         return 'Copiar código'
      //       case 'ru':
      //         return 'Скопировать код'
      //       case 'zh':
      //         return '复制代码'
      //       default:
      //         return 'Copy code'
      //     }
      //   })()
      //   return fence(tokens, idx, options, env, self).replace(
      //     '<button title="Copy Code" class="copy"></button>',
      //     `<button title="${codeCopyButtonTitle}" class="copy"></button>`
      //   )
      // }
      // md.use(groupIconMdPlugin)
    // }
  },
  head,
  themeConfig: {
    logo: { src: '../vitepress-logo-mini.svg', width: 24, height: 24 },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],
    agolia: {
      apiKey: '99caf32e743ba77d78b095b763b8e380',
      appId: 'ZM3TI8AKL4',
    },
    sidebars,
    nav,
    langs: languages,
  },
  locales,
  vue: {
    compiler: vueCompiler,
    template: {
      compilerOptions: {
        hoistStatic: false,
        directiveTransforms: buildTransformers(),
      },
    },
  },
  transformPageData: prod
    ? (pageData, ctx) => {
        const site = resolveSiteDataByRoute(
          ctx.siteConfig.site,
          pageData.relativePath
        )
        const title = `${pageData.title || site.title} | ${pageData.description || site.description}`
        ;((pageData.frontmatter.head ??= []) as HeadConfig[]).push(
          ['meta', { property: 'og:locale', content: site.lang }],
          ['meta', { property: 'og:title', content: title }]
        )
      }
    : undefined,
  
      postRender(context) {
        // Inject the teleport markup
        if (context.teleports) {
          const body = Object.entries(context.teleports).reduce(
            (all, [key, value]) => {
              if (key.startsWith('#el-popper-container-')) {
                return `${all}<div id="${key.slice(1)}">${value}</div>`
              }
              return all
            },
            context.teleports.body || ''
          )
  
          context.teleports = { ...context.teleports, body }
        }
  
        return context
      },
    }
  
    return config
}
  export default setupConfig
