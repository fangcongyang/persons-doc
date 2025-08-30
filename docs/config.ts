// import { defineAdditionalConfig, type DefaultTheme } from 'vitepress'

// export default defineAdditionalConfig({
//   lang: 'zh-CN',
//   description: 'Vite & Vue powered static site generator.',

//   themeConfig: {
//     nav: nav(),

//     sidebar: {
//       '/database/': { base: '/database/', items: sidebarDatabase() }
//     },

//     editLink: {
//       pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
//       text: 'Edit this page on GitHub'
//     },

//     footer: {
//       message: 'Released under the MIT License.',
//       copyright: 'Copyright © 2019-present Evan You'
//     }
//   }
// })



// function sidebarDatabase(): DefaultTheme.SidebarItem[] {
//   return [
//     {
//       text: '数据库',
//       items: [
//         { text: 'Postgres', base: '/database/postgres-', 
//           items: [
//             { text: 'Postgres 安装', link: 'install' },
//             { text: 'Postgres Sql', link: 'sql' },
//           ]},
//       ]
//     }
//   ]
// }