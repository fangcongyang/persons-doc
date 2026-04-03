import { isClient } from "@vueuse/core"

import VPApp, { NotFound, globals } from "../vitepress"
import { define } from "../utils/types"
import "uno.css"
import "./style.css"
import "vitepress/dist/client/theme-default/styles/components/vp-code-group.css"
import "virtual:group-icons.css"
import type { Theme } from "vitepress"

export default define<Theme>({
  NotFound,
  Layout: VPApp,
  enhanceApp: async ({ app, router }) => {
    globals.forEach(([name, Comp]) => {
      app.component(name, Comp)
    })
    
    // 只在客户端加载 Element Plus
    if (isClient) {
      const ElementPlus = (await import("element-plus")).default
      const ElementPlusIconsVue = (await import("@element-plus/icons-vue"))
      const { ID_INJECTION_KEY } = await import("element-plus")
      
      app.use(ElementPlus)
      
      // 提供 ID_INJECTION_KEY
      app.provide(ID_INJECTION_KEY, {
        prefix: Math.floor(Math.random() * 10000),
        current: 0,
      })
      
      // 注册所有Element Plus图标
      for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
        app.component(key, component)
      }
      
      const nprogress = await import("nprogress")
      router.onBeforeRouteChange = nprogress.start
      router.onAfterRouteChanged = nprogress.done
    }
  },
})
