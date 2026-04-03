import fs from 'fs'
import path from 'path'
import { vpRoot } from '../../build-utils'
import { languages } from '../utils/lang'

import type { HeadConfig } from 'vitepress'

/**
 * 创建 VitePress 的 head 配置
 * @param base 站点基础路径，如 '/persons-doc/'
 * @returns HeadConfig 数组
 */
export const createHead = (base: string): HeadConfig[] => {
  const langScript = fs
    .readFileSync(path.resolve(vpRoot, 'lang.js'), 'utf-8')
    .replace('{{BASE}}', base)

  return [
    [
      'link',
      {
        rel: 'icon',
        href: `${base}images/element-plus-logo-small.svg`,
        type: 'image/svg+xm',
      },
    ],
    [
      'link',
      {
        rel: 'apple-touch-icon',
        href: `${base}apple-touch-icon.png`,
        sizes: '180x180',
      },
    ],
    [
      'link',
      {
        rel: 'mask-icon',
        href: `${base}safari-pinned-tab.svg`,
        color: '#5bbad5',
      },
    ],
    [
      'meta',
      {
        name: 'theme-color',
        content: '#ffffff',
      },
    ],
    [
      'meta',
      {
        name: 'msapplication-TileColor',
        content: '#409eff',
      },
    ],
    [
      'meta',
      {
        name: 'msapplication-config',
        content: `${base}browserconfig.xml`,
      },
    ],
    [
      'meta',
      {
        property: 'og:image',
        content: `${base}images/element-plus-og-image.png`,
      },
    ],
    [
      'meta',
      {
        property: 'og:image:width',
        content: '1200',
      },
    ],
    [
      'meta',
      {
        property: 'og:image:height',
        content: '630',
      },
    ],
    [
      'meta',
      {
        property: 'og:description',
        content: 'A Vue 3 based component library for designers and developers',
      },
    ],
    [
      'meta',
      {
        name: 'baidu-site-verification',
        content: 'codeva-q5gBxYcfOs',
      },
    ],
    [
      'script',
      {},
      `;(() => {
      window.supportedLangs = ${JSON.stringify(languages)}
    })()`,
    ],

    ['script', {}, langScript],
    [
      'script',
      {
        async: 'true',
        src: 'https://www.googletagmanager.com/gtag/js?id=UA-175337989-1',
      },
    ],
    [
      'script',
      {},
      `if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('${base}sw.js')
        .then(function(registration) {
          console.log(registration);
        })
        .catch(function(err) {
          console.log(err);
        });
    }`,
    ],
    [
      'script',
      {
        async: 'true',
      },
      `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'UA-175337989-1');`,
    ],
    [
      'script',
      {
        async: 'true',
        src: 'https://www.googletagmanager.com/gtag/js?id=G-M74ZHEQ1M1',
      },
    ],
    [
      'script',
      {},
      `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-M74ZHEQ1M1');
    `,
    ],
    [
      'script',
      {
        async: 'true',
      },
      `
  var resource = document.createElement('link');
  resource.setAttribute("rel", "stylesheet");
  resource.setAttribute("href","https://fonts.googleapis.com/css?family=Inter:300,400,500,600,700,800|Open+Sans:400,600;display=swap");
  resource.setAttribute("type","text/css");
  var head = document.querySelector('head');
  head.appendChild(resource);
    `,
    ],
  ]
}
