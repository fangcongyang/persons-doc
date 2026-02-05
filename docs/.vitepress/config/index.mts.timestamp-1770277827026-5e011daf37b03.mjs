// docs/.vitepress/utils/lang.ts
import fs from "fs";
import path from "path";

// docs/build-utils/index.ts
import { resolve } from "path";
import consola from "file:///D:/app/persons-doc/node_modules/.pnpm/consola@3.4.2/node_modules/consola/dist/index.mjs";
var __vite_injected_original_dirname = "D:\\app\\persons-doc\\docs\\build-utils";
var projRoot = resolve(__vite_injected_original_dirname, "..", "..");
var docsDirName = "docs";
var docRoot = resolve(projRoot, docsDirName);
var vpRoot = resolve(docRoot, ".vitepress");
var docPackage = resolve(projRoot, "package.json");

// docs/.vitepress/utils/lang.ts
var __vite_injected_original_dirname2 = "D:\\app\\persons-doc\\docs\\.vitepress\\utils";
var languages = fs.readdirSync(path.resolve(__vite_injected_original_dirname2, "../crowdin"));
var ensureLang = (lang) => `/${lang}`;
var getLang = (id) => path.relative(docRoot, id).split(path.sep)[0];

// docs/.vitepress/config/plugins.ts
import mdContainer from "file:///D:/app/persons-doc/node_modules/.pnpm/markdown-it-container@4.0.0/node_modules/markdown-it-container/index.mjs";

// docs/.vitepress/plugins/demo.ts
import path2 from "path";
import fs2 from "fs";
function createDemoContainer(md) {
  return {
    validate(params) {
      return !!params.trim().match(/^demo\s*(.*)$/);
    },
    render(tokens, idx) {
      const m = tokens[idx].info.trim().match(/^demo\s*(.*)$/);
      if (tokens[idx].nesting === 1) {
        const description = m && m.length > 1 ? m[1] : "";
        const sourceFileToken = tokens[idx + 2];
        let source = "";
        const sourceFile = sourceFileToken.children?.[0].content ?? "";
        if (sourceFileToken.type === "inline") {
          source = fs2.readFileSync(
            path2.resolve(docRoot, "examples", `${sourceFile}.vue`),
            "utf-8"
          );
        }
        if (!source) throw new Error(`Incorrect source file: ${sourceFile}`);
        return `<Demo source="${encodeURIComponent(
          md.render(`\`\`\` vue
${source}\`\`\``)
        )}" path="${sourceFile}" raw-source="${encodeURIComponent(
          source
        )}" description="${encodeURIComponent(md.render(description))}">
  <template #source><ep-${sourceFile.replaceAll("/", "-")}/></template>`;
      } else {
        return "</Demo>\n";
      }
    }
  };
}
var demo_default = createDemoContainer;

// docs/.vitepress/plugins/headers.ts
import { resolveHeadersFromTokens, slugify } from "file:///D:/app/persons-doc/node_modules/.pnpm/@mdit-vue+shared@2.1.4/node_modules/@mdit-vue/shared/dist/index.mjs";
var headers_default = (md) => {
  const render = md.renderer.render.bind(md.renderer);
  const level = [2, 3, 4, 5, 6];
  md.renderer.render = (tokens, options, env) => {
    env.headers = resolveHeadersFromTokens(tokens, {
      level,
      shouldAllowHtml: true,
      shouldAllowNested: false,
      shouldEscapeText: false,
      slugify
    });
    env.headers.forEach((header) => {
      header.title = header.title.replace(/\s+</g, "<");
    });
    return render(tokens, options, env);
  };
};

// docs/.vitepress/config/plugins.ts
var mdPlugin = (md) => {
  md.use(headers_default);
  md.use(mdContainer, "demo", demo_default(md));
};

// docs/.vitepress/config/head.ts
import fs3 from "fs";
import path3 from "path";
var head = [
  [
    "link",
    {
      rel: "icon",
      href: "/images/element-plus-logo-small.svg",
      type: "image/svg+xm"
    }
  ],
  [
    "link",
    {
      rel: "apple-touch-icon",
      href: "/apple-touch-icon.png",
      sizes: "180x180"
    }
  ],
  [
    "link",
    {
      rel: "mask-icon",
      href: "/safari-pinned-tab.svg",
      color: "#5bbad5"
    }
  ],
  [
    "meta",
    {
      name: "theme-color",
      content: "#ffffff"
    }
  ],
  [
    "meta",
    {
      name: "msapplication-TileColor",
      content: "#409eff"
    }
  ],
  [
    "meta",
    {
      name: "msapplication-config",
      content: "/browserconfig.xml"
    }
  ],
  [
    "meta",
    {
      property: "og:image",
      content: "/images/element-plus-og-image.png"
    }
  ],
  [
    "meta",
    {
      property: "og:image:width",
      content: "1200"
    }
  ],
  [
    "meta",
    {
      property: "og:image:height",
      content: "630"
    }
  ],
  [
    "meta",
    {
      property: "og:description",
      content: "A Vue 3 based component library for designers and developers"
    }
  ],
  [
    "meta",
    {
      name: "baidu-site-verification",
      content: "codeva-q5gBxYcfOs"
    }
  ],
  [
    "script",
    {},
    `;(() => {
      window.supportedLangs = ${JSON.stringify(languages)}
    })()`
  ],
  ["script", {}, fs3.readFileSync(path3.resolve(vpRoot, "lang.js"), "utf-8")],
  [
    "script",
    {
      async: "true",
      src: "https://www.googletagmanager.com/gtag/js?id=UA-175337989-1"
    }
  ],
  [
    "script",
    {},
    `if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(function(registration) {
          console.log(registration);
        })
        .catch(function(err) {
          console.log(err);
        });
    }`
  ],
  [
    "script",
    {
      async: "true"
    },
    `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'UA-175337989-1');`
  ],
  [
    "script",
    {
      async: "true",
      src: "https://www.googletagmanager.com/gtag/js?id=G-M74ZHEQ1M1"
    }
  ],
  [
    "script",
    {},
    `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-M74ZHEQ1M1');
    `
  ],
  [
    "script",
    {
      async: "true"
    },
    `
  var resource = document.createElement('link');
  resource.setAttribute("rel", "stylesheet");
  resource.setAttribute("href","https://fonts.googleapis.com/css?family=Inter:300,400,500,600,700,800|Open+Sans:400,600;display=swap");
  resource.setAttribute("type","text/css");
  var head = document.querySelector('head');
  head.appendChild(resource);
    `
  ]
];

// docs/.vitepress/config/nav.ts
import { isExternal } from "file:///D:/app/persons-doc/node_modules/.pnpm/vitepress@1.6.3_@algolia+client-search@5.25.0_@types+node@22.15.17_async-validator@4.2.5_axio_6ginl6gtkhe6blejfwdb5oo6cq/node_modules/vitepress/dist/client/shared.js";

// docs/.vitepress/i18n/pages/sidebar.json
var sidebar_default = {
  "en-US": [
    {
      text: "java",
      link: "/java/env",
      activeMatch: "/java/"
    },
    {
      text: "system",
      link: "/system/linux/common-commands",
      activeMatch: "/system/"
    },
    {
      text: "Vue",
      link: "/vue/echarts-line",
      activeMatch: "/vue/"
    },
    {
      text: "\u6570\u636E\u5E93",
      link: "/database/postgres/postgres-install",
      activeMatch: "/database/"
    },
    {
      text: "\u4E2D\u95F4\u4EF6",
      link: "/middleware/tomcat/base",
      activeMatch: "/middleware/"
    }
  ]
};

// docs/.vitepress/config/nav.ts
function getNav() {
  return Object.fromEntries(
    Object.entries(sidebar_default).map(([lang, locales2]) => {
      const item = Object.values(locales2).map((item2) => ({
        ...item2,
        link: `${isExternal(item2.link) ? "" : ensureLang(lang)}${item2.link}`
      }));
      return [lang, item];
    })
  );
}
var nav = getNav();

// docs/.vitepress/i18n/pages/java.json
var java_default = {
  "en-US": {
    env: {
      text: "\u5FEB\u901F\u5F00\u59CB",
      base: "/java/",
      children: [
        {
          text: "\u73AF\u5883\u642D\u5EFA",
          link: "env"
        }
      ]
    },
    "commonly-used": {
      text: "\u5E38\u7528\u4EE3\u7801",
      base: "/java/commonly-used/",
      children: [
        {
          text: "JSON",
          link: "json"
        },
        {
          text: "Excel",
          link: "excel"
        }
      ]
    },
    basic: {
      text: "Basic",
      children: [
        {
          link: "/button",
          text: "Button"
        },
        {
          link: "/border",
          text: "Border"
        },
        {
          link: "/color",
          text: "Color"
        },
        {
          link: "/container",
          text: "Layout Container"
        },
        {
          link: "/icon",
          text: "Icon"
        },
        {
          link: "/layout",
          text: "Layout"
        },
        {
          link: "/link",
          text: "Link"
        },
        {
          link: "/text",
          text: "Text",
          promotion: "2.3.0"
        },
        {
          link: "/scrollbar",
          text: "Scrollbar"
        },
        {
          link: "/space",
          text: "Space"
        },
        {
          link: "/typography",
          text: "Typography"
        }
      ]
    },
    configuration: {
      text: "Configuration",
      children: [
        {
          link: "/config-provider",
          text: "Config Provider"
        }
      ]
    },
    form: {
      text: "Form",
      children: [
        {
          link: "/autocomplete",
          text: "Autocomplete"
        },
        {
          link: "/cascader",
          text: "Cascader"
        },
        {
          link: "/checkbox",
          text: "Checkbox"
        },
        {
          link: "/color-picker",
          text: "Color Picker"
        },
        {
          link: "/date-picker",
          text: "Date Picker"
        },
        {
          link: "/datetime-picker",
          text: "DateTime Picker"
        },
        {
          link: "/form",
          text: "Form"
        },
        {
          link: "/input",
          text: "Input"
        },
        {
          link: "/input-number",
          text: "Input Number"
        },
        {
          link: "/input-tag",
          text: "Input Tag",
          promotion: "2.9.0"
        },
        {
          link: "/mention",
          text: "Mention",
          promotion: "2.8.0"
        },
        {
          link: "/radio",
          text: "Radio"
        },
        {
          link: "/rate",
          text: "Rate"
        },
        {
          link: "/select",
          text: "Select"
        },
        {
          link: "/select-v2",
          text: "Virtualized Select"
        },
        {
          link: "/slider",
          text: "Slider"
        },
        {
          link: "/switch",
          text: "Switch"
        },
        {
          link: "/time-picker",
          text: "Time Picker"
        },
        {
          link: "/time-select",
          text: "Time Select"
        },
        {
          link: "/transfer",
          text: "Transfer"
        },
        {
          link: "/tree-select",
          text: "TreeSelect",
          promotion: "2.1.8"
        },
        {
          link: "/upload",
          text: "Upload"
        }
      ]
    },
    data: {
      text: "Data",
      children: [
        {
          link: "/avatar",
          text: "Avatar"
        },
        {
          link: "/badge",
          text: "Badge"
        },
        {
          link: "/calendar",
          text: "Calendar"
        },
        {
          link: "/card",
          text: "Card"
        },
        {
          link: "/carousel",
          text: "Carousel"
        },
        {
          link: "/collapse",
          text: "Collapse"
        },
        {
          link: "/descriptions",
          text: "Descriptions"
        },
        {
          link: "/empty",
          text: "Empty"
        },
        {
          link: "/image",
          text: "Image"
        },
        {
          link: "/infinite-scroll",
          text: "Infinite Scroll"
        },
        {
          link: "/pagination",
          text: "Pagination"
        },
        {
          link: "/progress",
          text: "Progress"
        },
        {
          link: "/result",
          text: "Result"
        },
        {
          link: "/skeleton",
          text: "Skeleton"
        },
        {
          link: "/table",
          text: "Table"
        },
        {
          link: "/table-v2",
          text: "Virtualized Table",
          promotion: "2.2.0"
        },
        {
          link: "/tag",
          text: "Tag"
        },
        {
          link: "/timeline",
          text: "Timeline"
        },
        {
          link: "/tour",
          text: "Tour",
          promotion: "2.5.0"
        },
        {
          link: "/tree",
          text: "Tree"
        },
        {
          link: "/tree-v2",
          text: "Virtualized Tree"
        },
        {
          link: "/statistic",
          text: "Statistic",
          promotion: "2.2.30"
        },
        {
          link: "/segmented",
          text: "Segmented",
          promotion: "2.7.0"
        }
      ]
    },
    navigation: {
      text: "Navigation",
      children: [
        {
          link: "/affix",
          text: "Affix"
        },
        {
          link: "/anchor",
          text: "Anchor",
          promotion: "2.6.0"
        },
        {
          link: "/backtop",
          text: "Backtop"
        },
        {
          link: "/breadcrumb",
          text: "Breadcrumb"
        },
        {
          link: "/dropdown",
          text: "Dropdown"
        },
        {
          link: "/menu",
          text: "Menu"
        },
        {
          link: "/page-header",
          text: "Page Header"
        },
        {
          link: "/steps",
          text: "Steps"
        },
        {
          link: "/tabs",
          text: "Tabs"
        }
      ]
    },
    feedback: {
      text: "Feedback",
      children: [
        {
          link: "/alert",
          text: "Alert"
        },
        {
          link: "/dialog",
          text: "Dialog"
        },
        {
          link: "/drawer",
          text: "Drawer"
        },
        {
          link: "/loading",
          text: "Loading"
        },
        {
          link: "/message",
          text: "Message"
        },
        {
          link: "/message-box",
          text: "Message Box"
        },
        {
          link: "/notification",
          text: "Notification"
        },
        {
          link: "/popconfirm",
          text: "Popconfirm"
        },
        {
          link: "/popover",
          text: "Popover"
        },
        {
          link: "/tooltip",
          text: "Tooltip"
        }
      ]
    },
    others: {
      text: "Others",
      children: [
        {
          link: "/divider",
          text: "Divider"
        },
        {
          link: "/watermark",
          text: "Watermark",
          promotion: "2.4.0"
        }
      ]
    }
  }
};

// docs/.vitepress/i18n/pages/rust.json
var rust_default = {
  "en-US": {
    env: {
      text: "\u5FEB\u901F\u5F00\u59CB",
      base: "/rust/",
      children: [
        {
          text: "\u5FEB\u901F\u5F00\u59CB",
          link: "rust-start-quickly"
        },
        {
          text: "cargo",
          link: "cargo"
        }
      ]
    }
  }
};

// docs/.vitepress/i18n/pages/system.json
var system_default = {
  "en-US": {
    system: {
      text: "System",
      base: "/system/linux/",
      children: [
        {
          text: "\u5E38\u7528\u547D\u4EE4",
          link: "common-commands"
        }
      ]
    }
  }
};

// docs/.vitepress/i18n/pages/vue.json
var vue_default = {
  "en-US": {
    echarts: {
      text: "Echarts",
      base: "/vue/echarts-",
      children: [
        {
          text: "\u6298\u7EBF\u56FE",
          link: "line"
        }
      ]
    }
  }
};

// docs/.vitepress/i18n/pages/database.json
var database_default = {
  "en-US": {
    postgres: {
      text: "Postgres",
      base: "/database/postgres/",
      children: [
        {
          text: "\u5B89\u88C5",
          link: "postgres-install"
        },
        {
          text: "pg-sql",
          link: "postgres-sql"
        }
      ]
    }
  }
};

// docs/.vitepress/i18n/pages/middleware.json
var middleware_default = {
  "en-US": {
    tomcat: {
      text: "Tomcat",
      base: "/middleware/tomcat/",
      children: [
        {
          text: "\u57FA\u7840",
          link: "base"
        },
        {
          text: "HTTPS",
          link: "https"
        },
        {
          text: "\u4F18\u5316",
          link: "optimization"
        }
      ]
    }
  }
};

// docs/.vitepress/config/sidebars.ts
function getJavaSidebar() {
  return Object.fromEntries(
    Object.entries(java_default).map(([lang, val]) => [
      lang,
      Object.values(val).map((item) => mapPrefix(item, lang, "base" in item ? item.base : ""))
    ])
  );
}
function getRustSidebar() {
  return Object.fromEntries(
    Object.entries(rust_default).map(([lang, val]) => [
      lang,
      Object.values(val).map((item) => mapPrefix(item, lang, "base" in item ? item.base : ""))
    ])
  );
}
function getSystemSidebar() {
  return Object.fromEntries(
    Object.entries(system_default).map(([lang, val]) => [
      lang,
      Object.values(val).map((item) => mapPrefix(item, lang, item.base))
    ])
  );
}
function getDatabaseSideBar() {
  return Object.fromEntries(
    Object.entries(database_default).map(([lang, val]) => [
      lang,
      Object.values(val).map((item) => mapPrefix(item, lang, item.base))
    ])
  );
}
function getVueSideBar() {
  return Object.fromEntries(
    Object.entries(vue_default).map(([lang, val]) => [
      lang,
      Object.values(val).map((item) => mapPrefix(item, lang, item.base))
    ])
  );
}
function getMiddlewareSideBar() {
  return Object.fromEntries(
    Object.entries(middleware_default).map(([lang, val]) => [
      lang,
      Object.values(val).map((item) => mapPrefix(item, lang, item.base))
    ])
  );
}
var getSidebars = () => {
  return {
    "/java/": getJavaSidebar(),
    "/rust/": getRustSidebar(),
    "/system/": getSystemSidebar(),
    "/vue/": getVueSideBar(),
    "/database/": getDatabaseSideBar(),
    "/middleware/": getMiddlewareSideBar()
  };
};
function mapPrefix(item, lang, prefix = "") {
  if (item.children && item.children.length > 0) {
    return {
      ...item,
      children: item.children.map((child) => mapPrefix(child, lang, prefix))
    };
  }
  return {
    ...item,
    link: `${ensureLang(lang)}${prefix}${item.link}`
  };
}
var sidebars = getSidebars();

// docs/.vitepress/config/vite.ts
import path5 from "path";
import Inspect from "file:///D:/app/persons-doc/node_modules/.pnpm/vite-plugin-inspect@0.8.7_rollup@2.79.2_vite@5.4.19_@types+node@22.15.17_less@4.3.0_sass-embedded@1.88.0_terser@5.44.0_/node_modules/vite-plugin-inspect/dist/index.mjs";
import UnoCSS from "file:///D:/app/persons-doc/node_modules/.pnpm/unocss@66.1.1_postcss@8.5.3_vite@5.4.19_@types+node@22.15.17_less@4.3.0_sass-embedded@1.88.0_terser@5.44.0__vue@3.5.13/node_modules/unocss/dist/vite.mjs";
import mkcert from "file:///D:/app/persons-doc/node_modules/.pnpm/vite-plugin-mkcert@1.17.8_vite@5.4.19_@types+node@22.15.17_less@4.3.0_sass-embedded@1.88.0_terser@5.44.0_/node_modules/vite-plugin-mkcert/dist/mkcert.mjs";
import vueJsx from "file:///D:/app/persons-doc/node_modules/.pnpm/@vitejs+plugin-vue-jsx@4.1.2_vite@5.4.19_@types+node@22.15.17_less@4.3.0_sass-embedded@1.88.0_terser@5.44.0__vue@3.5.13/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import Components from "file:///D:/app/persons-doc/node_modules/.pnpm/unplugin-vue-components@28.5.0_@babel+parser@7.28.4_vue@3.5.13/node_modules/unplugin-vue-components/dist/vite.js";
import Icons from "file:///D:/app/persons-doc/node_modules/.pnpm/unplugin-icons@22.1.0_@vue+compiler-sfc@3.5.13/node_modules/unplugin-icons/dist/vite.js";
import IconsResolver from "file:///D:/app/persons-doc/node_modules/.pnpm/unplugin-icons@22.1.0_@vue+compiler-sfc@3.5.13/node_modules/unplugin-icons/dist/resolver.js";
import { loadEnv } from "file:///D:/app/persons-doc/node_modules/.pnpm/vitepress@1.6.3_@algolia+client-search@5.25.0_@types+node@22.15.17_async-validator@4.2.5_axio_6ginl6gtkhe6blejfwdb5oo6cq/node_modules/vitepress/dist/node/index.js";
import { groupIconVitePlugin } from "file:///D:/app/persons-doc/node_modules/.pnpm/vitepress-plugin-group-icons@1.5.2/node_modules/vitepress-plugin-group-icons/dist/index.mjs";

// docs/.vitepress/plugins/markdown-transform.ts
import fs4 from "fs";
import path4 from "path";
import { camelize } from "file:///D:/app/persons-doc/node_modules/.pnpm/@vue+shared@3.5.14/node_modules/@vue/shared/index.js";
import glob from "file:///D:/app/persons-doc/node_modules/.pnpm/fast-glob@3.3.3/node_modules/fast-glob/out/index.js";

// docs/.vitepress/i18n/component/footer.json
var footer_default = {
  "en-US": {
    source: "Source",
    contributors: "Contributors",
    component: "Component",
    style: "Style",
    docs: "Docs"
  }
};

// docs/.vitepress/plugins/markdown-transform.ts
var compPaths;
function MarkdownTransform() {
  return {
    name: "element-plus-md-transform",
    enforce: "pre",
    async buildStart() {
      const pattern = `{${[...languages, languages[0]].join(",")}}/component`;
      compPaths = await glob(pattern, {
        cwd: docRoot,
        absolute: true,
        onlyDirectories: true
      });
    },
    async transform(code, id) {
      if (!id.endsWith(".md")) return;
      const componentId = path4.basename(id, ".md");
      const append = {
        headers: [],
        footers: [],
        scriptSetups: getExampleImports(componentId)
      };
      code = transformVpScriptSetup(code, append);
      if (compPaths.some((compPath) => id.startsWith(compPath))) {
        code = transformComponentMarkdown(id, componentId, code, append);
      }
      return combineMarkdown(
        code,
        [combineScriptSetup(append.scriptSetups), ...append.headers],
        append.footers
      );
    }
  };
}
var combineScriptSetup = (codes) => `
<script setup>
${codes.join("\n")}
</script>
`;
var combineMarkdown = (code, headers, footers) => {
  const frontmatterEnds = code.indexOf("---\r\n\r\n");
  const firstHeader = code.search(/\n#{1,6}\s.+/);
  const sliceIndex = firstHeader < 0 ? frontmatterEnds < 0 ? 0 : frontmatterEnds + 4 : firstHeader;
  if (headers.length > 0)
    code = code.slice(0, sliceIndex) + headers.join("\n") + code.slice(sliceIndex);
  code += footers.join("\n");
  return `${code}
`;
};
var vpScriptSetupRE = /<vp-script\s(.*\s)?setup(\s.*)?>([\s\S]*)<\/vp-script>/;
var transformVpScriptSetup = (code, append) => {
  const matches = code.match(vpScriptSetupRE);
  if (matches) code = code.replace(matches[0], "");
  const scriptSetup = matches?.[3] ?? "";
  if (scriptSetup) append.scriptSetups.push(scriptSetup);
  return code;
};
var GITHUB_BLOB_URL = `https://github.com/element-plus/element-plus/blob/dev`;
var GITHUB_TREE_URL = `https://github.com/element-plus/element-plus/blob/dev`;
var transformComponentMarkdown = (id, componentId, code, append) => {
  const lang = getLang(id);
  const docUrl = `${GITHUB_BLOB_URL}/${docsDirName}/en-US/component/${componentId}.md`;
  const componentUrl = `${GITHUB_TREE_URL}/packages/components/${componentId}`;
  const styleUrl = `${GITHUB_TREE_URL}/packages/theme-chalk/src/${componentId}.scss`;
  const componentPath = path4.resolve(
    projRoot,
    `packages/components/${componentId}`
  );
  const stylePath = path4.resolve(
    projRoot,
    `packages/theme-chalk/src/${componentId}.scss`
  );
  const isComponent = fs4.existsSync(componentPath);
  const isHaveComponentStyle = fs4.existsSync(stylePath);
  const links = [[footer_default[lang].docs, docUrl]];
  if (isComponent && isHaveComponentStyle)
    links.unshift([footer_default[lang].style, styleUrl]);
  if (isComponent) links.unshift([footer_default[lang].component, componentUrl]);
  const linksText = links.filter((i) => i).map(([text, link]) => `[${text}](${link})`).join(" \u2022 ");
  const sourceSection = `
## ${footer_default[lang].source}

${linksText}`;
  const contributorsSection = `
## ${footer_default[lang].contributors}

<Contributors id="${componentId}" />`;
  append.footers.push(sourceSection, isComponent ? contributorsSection : "");
  return code;
};
var getExampleImports = (componentId) => {
  const examplePath = path4.resolve(docRoot, "examples", componentId);
  if (!fs4.existsSync(examplePath)) return [];
  const files = fs4.readdirSync(examplePath);
  const imports = [];
  for (const item of files) {
    if (!/\.vue$/.test(item)) continue;
    const file = item.replace(/\.vue$/, "");
    const name = camelize(`Ep-${componentId}-${file}`);
    imports.push(
      `import ${name} from '../../examples/${componentId}/${file}.vue'`
    );
  }
  return imports;
};

// docs/.vitepress/config/vite.ts
import llmstxt from "file:///D:/app/persons-doc/node_modules/.pnpm/vitepress-plugin-llms@1.1.4/node_modules/vitepress-plugin-llms/dist/index.js";
var __vite_injected_original_dirname3 = "D:\\app\\persons-doc\\docs\\.vitepress\\config";
var getViteConfig = ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ["legacy-js-api"]
        }
      }
    },
    server: {
      host: true,
      fs: {
        allow: [projRoot]
      }
    },
    resolve: {
      alias: [
        {
          find: "~/",
          replacement: `${path5.resolve(__vite_injected_original_dirname3, "../vitepress")}/`
        }
      ]
    },
    plugins: [
      vueJsx(),
      // https://github.com/antfu/unplugin-vue-components
      Components({
        dirs: [".vitepress/vitepress/components"],
        allowOverrides: true,
        // custom resolvers
        resolvers: [
          // auto import icons
          // https://github.com/antfu/unplugin-icons
          IconsResolver()
        ],
        // allow auto import and register components used in markdown
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/]
      }),
      // https://github.com/antfu/unplugin-icons
      Icons({
        autoInstall: true
      }),
      UnoCSS({
        inspector: false
      }),
      MarkdownTransform(),
      Inspect(),
      groupIconVitePlugin(),
      llmstxt({
        workDir: "zh",
        ignoreFiles: ["index.md"]
      }),
      env.HTTPS ? mkcert() : void 0
    ],
    // 确保Element Plus及其图标被正确处理
    optimizeDeps: {
      include: ["element-plus", "@element-plus/icons-vue"]
    }
  };
};

// docs/.vitepress/config/vue-compiler.ts
import { createRequire } from "node:module";
var __vite_injected_original_import_meta_url = "file:///D:/app/persons-doc/docs/.vitepress/config/vue-compiler.ts";
var _require = createRequire(__vite_injected_original_import_meta_url);
var vitepressPath = _require.resolve("vitepress");
var vueCompiler = _require(
  _require.resolve("vue/compiler-sfc", { paths: [vitepressPath] })
);

// docs/.vitepress/config/index.mts
var prod = !!process.env.NETLIFY;
var buildTransformers = () => {
  const transformer = () => {
    return {
      props: [],
      needRuntime: true
    };
  };
  const transformers = {};
  const directives = [
    "infinite-scroll",
    "loading",
    "popover",
    "click-outside",
    "repeat-click",
    "trap-focus",
    "mousewheel",
    "resize"
  ];
  directives.forEach((k) => {
    transformers[k] = transformer;
  });
  return transformers;
};
var locales = {};
languages.forEach((lang) => {
  locales[`/${lang}`] = {
    label: lang,
    lang
  };
});
var setupConfig = (configEnv) => {
  const config = {
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
      config: (md) => mdPlugin(md)
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
      logo: { src: "../vitepress-logo-mini.svg", width: 24, height: 24 },
      socialLinks: [
        { icon: "github", link: "https://github.com/vuejs/vitepress" }
      ],
      agolia: {
        apiKey: "99caf32e743ba77d78b095b763b8e380",
        appId: "ZM3TI8AKL4"
      },
      sidebars,
      nav,
      langs: languages
    },
    locales,
    vue: {
      compiler: vueCompiler,
      template: {
        compilerOptions: {
          hoistStatic: false,
          directiveTransforms: buildTransformers()
        }
      }
    },
    transformPageData: prod ? (pageData, ctx) => {
      const site = resolveSiteDataByRoute(
        ctx.siteConfig.site,
        pageData.relativePath
      );
      const title = `${pageData.title || site.title} | ${pageData.description || site.description}`;
      (pageData.frontmatter.head ??= []).push(
        ["meta", { property: "og:locale", content: site.lang }],
        ["meta", { property: "og:title", content: title }]
      );
    } : void 0,
    postRender(context) {
      if (context.teleports) {
        const body = Object.entries(context.teleports).reduce(
          (all, [key, value]) => {
            if (key.startsWith("#el-popper-container-")) {
              return `${all}<div id="${key.slice(1)}">${value}</div>`;
            }
            return all;
          },
          context.teleports.body || ""
        );
        context.teleports = { ...context.teleports, body };
      }
      return context;
    }
  };
  return config;
};
var config_default = setupConfig;
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiZG9jcy8udml0ZXByZXNzL3V0aWxzL2xhbmcudHMiLCAiZG9jcy9idWlsZC11dGlscy9pbmRleC50cyIsICJkb2NzLy52aXRlcHJlc3MvY29uZmlnL3BsdWdpbnMudHMiLCAiZG9jcy8udml0ZXByZXNzL3BsdWdpbnMvZGVtby50cyIsICJkb2NzLy52aXRlcHJlc3MvcGx1Z2lucy9oZWFkZXJzLnRzIiwgImRvY3MvLnZpdGVwcmVzcy9jb25maWcvaGVhZC50cyIsICJkb2NzLy52aXRlcHJlc3MvY29uZmlnL25hdi50cyIsICJkb2NzLy52aXRlcHJlc3MvaTE4bi9wYWdlcy9zaWRlYmFyLmpzb24iLCAiZG9jcy8udml0ZXByZXNzL2kxOG4vcGFnZXMvamF2YS5qc29uIiwgImRvY3MvLnZpdGVwcmVzcy9pMThuL3BhZ2VzL3J1c3QuanNvbiIsICJkb2NzLy52aXRlcHJlc3MvaTE4bi9wYWdlcy9zeXN0ZW0uanNvbiIsICJkb2NzLy52aXRlcHJlc3MvaTE4bi9wYWdlcy92dWUuanNvbiIsICJkb2NzLy52aXRlcHJlc3MvaTE4bi9wYWdlcy9kYXRhYmFzZS5qc29uIiwgImRvY3MvLnZpdGVwcmVzcy9pMThuL3BhZ2VzL21pZGRsZXdhcmUuanNvbiIsICJkb2NzLy52aXRlcHJlc3MvY29uZmlnL3NpZGViYXJzLnRzIiwgImRvY3MvLnZpdGVwcmVzcy9jb25maWcvdml0ZS50cyIsICJkb2NzLy52aXRlcHJlc3MvcGx1Z2lucy9tYXJrZG93bi10cmFuc2Zvcm0udHMiLCAiZG9jcy8udml0ZXByZXNzL2kxOG4vY29tcG9uZW50L2Zvb3Rlci5qc29uIiwgImRvY3MvLnZpdGVwcmVzcy9jb25maWcvdnVlLWNvbXBpbGVyLnRzIiwgImRvY3MvLnZpdGVwcmVzcy9jb25maWcvaW5kZXgubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcYXBwXFxcXHBlcnNvbnMtZG9jXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFx1dGlsc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcYXBwXFxcXHBlcnNvbnMtZG9jXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFx1dGlsc1xcXFxsYW5nLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9hcHAvcGVyc29ucy1kb2MvZG9jcy8udml0ZXByZXNzL3V0aWxzL2xhbmcudHNcIjtpbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgZG9jUm9vdCB9IGZyb20gJy4uLy4uL2J1aWxkLXV0aWxzJ1xuXG5leHBvcnQgY29uc3QgbGFuZ3VhZ2VzID0gZnMucmVhZGRpclN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL2Nyb3dkaW4nKSlcblxuZXhwb3J0IGNvbnN0IGVuc3VyZUxhbmcgPSAobGFuZzogc3RyaW5nKSA9PiBgLyR7bGFuZ31gXG5cbmV4cG9ydCBjb25zdCBnZXRMYW5nID0gKGlkOiBzdHJpbmcpID0+XG4gIHBhdGgucmVsYXRpdmUoZG9jUm9vdCwgaWQpLnNwbGl0KHBhdGguc2VwKVswXVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxhcHBcXFxccGVyc29ucy1kb2NcXFxcZG9jc1xcXFxidWlsZC11dGlsc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcYXBwXFxcXHBlcnNvbnMtZG9jXFxcXGRvY3NcXFxcYnVpbGQtdXRpbHNcXFxcaW5kZXgudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L2FwcC9wZXJzb25zLWRvYy9kb2NzL2J1aWxkLXV0aWxzL2luZGV4LnRzXCI7aW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnXHJcbmltcG9ydCBwcm9jZXNzIGZyb20gJ3Byb2Nlc3MnXHJcbmltcG9ydCBjb25zb2xhIGZyb20gJ2NvbnNvbGEnXHJcblxyXG5leHBvcnQgY29uc3QgcHJvalJvb3QgPSByZXNvbHZlKF9fZGlybmFtZSwgJy4uJywgJy4uJylcclxuXHJcbi8vIERvY3NcclxuZXhwb3J0IGNvbnN0IGRvY3NEaXJOYW1lID0gJ2RvY3MnXHJcbmV4cG9ydCBjb25zdCBkb2NSb290ID0gcmVzb2x2ZShwcm9qUm9vdCwgZG9jc0Rpck5hbWUpXHJcbmV4cG9ydCBjb25zdCB2cFJvb3QgPSByZXNvbHZlKGRvY1Jvb3QsICcudml0ZXByZXNzJylcclxuXHJcbmV4cG9ydCBjb25zdCBkb2NQYWNrYWdlID0gcmVzb2x2ZShwcm9qUm9vdCwgJ3BhY2thZ2UuanNvbicpXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZXJyb3JBbmRFeGl0KGVycjogRXJyb3IpOiBuZXZlciB7XHJcbiAgICBjb25zb2xhLmVycm9yKGVycilcclxuICAgIHByb2Nlc3MuZXhpdCgxKVxyXG4gIH1cclxuXHJcbiAgZXhwb3J0IGNvbnN0IGdldFBhY2thZ2VNYW5pZmVzdCA9IChwa2dQYXRoOiBzdHJpbmcpID0+IHtcclxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdmFyLXJlcXVpcmVzXHJcbiAgICByZXR1cm4gcmVxdWlyZShwa2dQYXRoKSBhcyBQcm9qZWN0TWFuaWZlc3RcclxuICB9XHJcblxyXG4gIGV4cG9ydCBjb25zdCBnZXRQYWNrYWdlRGVwZW5kZW5jaWVzID0gKFxyXG4gICAgcGtnUGF0aDogc3RyaW5nXHJcbiAgKTogUmVjb3JkPCdkZXBlbmRlbmNpZXMnIHwgJ3BlZXJEZXBlbmRlbmNpZXMnLCBzdHJpbmdbXT4gPT4ge1xyXG4gICAgY29uc3QgbWFuaWZlc3QgPSBnZXRQYWNrYWdlTWFuaWZlc3QocGtnUGF0aClcclxuICAgIGNvbnN0IHsgZGVwZW5kZW5jaWVzID0ge30sIHBlZXJEZXBlbmRlbmNpZXMgPSB7fSB9ID0gbWFuaWZlc3RcclxuICBcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGRlcGVuZGVuY2llczogT2JqZWN0LmtleXMoZGVwZW5kZW5jaWVzKSxcclxuICAgICAgcGVlckRlcGVuZGVuY2llczogT2JqZWN0LmtleXMocGVlckRlcGVuZGVuY2llcyksXHJcbiAgICB9XHJcbiAgfSIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcYXBwXFxcXHBlcnNvbnMtZG9jXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFxjb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXGFwcFxcXFxwZXJzb25zLWRvY1xcXFxkb2NzXFxcXC52aXRlcHJlc3NcXFxcY29uZmlnXFxcXHBsdWdpbnMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L2FwcC9wZXJzb25zLWRvYy9kb2NzLy52aXRlcHJlc3MvY29uZmlnL3BsdWdpbnMudHNcIjtpbXBvcnQgbWRDb250YWluZXIgZnJvbSAnbWFya2Rvd24taXQtY29udGFpbmVyJ1xyXG5pbXBvcnQgY3JlYXRlRGVtb0NvbnRhaW5lciBmcm9tICcuLi9wbHVnaW5zL2RlbW8nXHJcbmltcG9ydCBoZWFkZXJzIGZyb20gJy4uL3BsdWdpbnMvaGVhZGVycydcclxuaW1wb3J0IHR5cGUgeyBNYXJrZG93blJlbmRlcmVyIH0gZnJvbSAndml0ZXByZXNzJ1xyXG5cclxuZXhwb3J0IGNvbnN0IG1kUGx1Z2luID0gKG1kOiBNYXJrZG93blJlbmRlcmVyKSA9PiB7XHJcbiAgbWQudXNlKGhlYWRlcnMpXHJcbiAgbWQudXNlKG1kQ29udGFpbmVyLCAnZGVtbycsIGNyZWF0ZURlbW9Db250YWluZXIobWQpKVxyXG59IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxhcHBcXFxccGVyc29ucy1kb2NcXFxcZG9jc1xcXFwudml0ZXByZXNzXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXGFwcFxcXFxwZXJzb25zLWRvY1xcXFxkb2NzXFxcXC52aXRlcHJlc3NcXFxccGx1Z2luc1xcXFxkZW1vLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9hcHAvcGVyc29ucy1kb2MvZG9jcy8udml0ZXByZXNzL3BsdWdpbnMvZGVtby50c1wiO2ltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcbmltcG9ydCBmcyBmcm9tICdmcydcclxuaW1wb3J0IHsgZG9jUm9vdCB9IGZyb20gJy4uLy4uL2J1aWxkLXV0aWxzJ1xyXG5pbXBvcnQgdHlwZSB7IE1hcmtkb3duUmVuZGVyZXIgfSBmcm9tICd2aXRlcHJlc3MnXHJcblxyXG5pbnRlcmZhY2UgQ29udGFpbmVyT3B0cyB7XHJcbiAgbWFya2VyPzogc3RyaW5nIHwgdW5kZWZpbmVkXHJcbiAgdmFsaWRhdGU/KHBhcmFtczogc3RyaW5nKTogYm9vbGVhblxyXG4gIHJlbmRlcj86IE1hcmtkb3duUmVuZGVyZXJbJ3JlbmRlcmVyJ11bJ3J1bGVzJ11bJ2NvbnRhaW5lciddXHJcbn1cclxuZnVuY3Rpb24gY3JlYXRlRGVtb0NvbnRhaW5lcihtZDogTWFya2Rvd25SZW5kZXJlcik6IENvbnRhaW5lck9wdHMge1xyXG4gIHJldHVybiB7XHJcbiAgICB2YWxpZGF0ZShwYXJhbXMpIHtcclxuICAgICAgcmV0dXJuICEhcGFyYW1zLnRyaW0oKS5tYXRjaCgvXmRlbW9cXHMqKC4qKSQvKVxyXG4gICAgfSxcclxuXHJcbiAgICByZW5kZXIodG9rZW5zLCBpZHgpIHtcclxuICAgICAgY29uc3QgbSA9IHRva2Vuc1tpZHhdLmluZm8udHJpbSgpLm1hdGNoKC9eZGVtb1xccyooLiopJC8pXHJcbiAgICAgIGlmICh0b2tlbnNbaWR4XS5uZXN0aW5nID09PSAxIC8qIG1lYW5zIHRoZSB0YWcgaXMgb3BlbmluZyAqLykge1xyXG4gICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gbSAmJiBtLmxlbmd0aCA+IDEgPyBtWzFdIDogJydcclxuICAgICAgICBjb25zdCBzb3VyY2VGaWxlVG9rZW4gPSB0b2tlbnNbaWR4ICsgMl1cclxuICAgICAgICBsZXQgc291cmNlID0gJydcclxuICAgICAgICBjb25zdCBzb3VyY2VGaWxlID0gc291cmNlRmlsZVRva2VuLmNoaWxkcmVuPy5bMF0uY29udGVudCA/PyAnJ1xyXG5cclxuICAgICAgICBpZiAoc291cmNlRmlsZVRva2VuLnR5cGUgPT09ICdpbmxpbmUnKSB7XHJcbiAgICAgICAgICBzb3VyY2UgPSBmcy5yZWFkRmlsZVN5bmMoXHJcbiAgICAgICAgICAgIHBhdGgucmVzb2x2ZShkb2NSb290LCAnZXhhbXBsZXMnLCBgJHtzb3VyY2VGaWxlfS52dWVgKSxcclxuICAgICAgICAgICAgJ3V0Zi04J1xyXG4gICAgICAgICAgKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXNvdXJjZSkgdGhyb3cgbmV3IEVycm9yKGBJbmNvcnJlY3Qgc291cmNlIGZpbGU6ICR7c291cmNlRmlsZX1gKVxyXG5cclxuICAgICAgICByZXR1cm4gYDxEZW1vIHNvdXJjZT1cIiR7ZW5jb2RlVVJJQ29tcG9uZW50KFxyXG4gICAgICAgICAgbWQucmVuZGVyKGBcXGBcXGBcXGAgdnVlXFxuJHtzb3VyY2V9XFxgXFxgXFxgYClcclxuICAgICAgICApfVwiIHBhdGg9XCIke3NvdXJjZUZpbGV9XCIgcmF3LXNvdXJjZT1cIiR7ZW5jb2RlVVJJQ29tcG9uZW50KFxyXG4gICAgICAgICAgc291cmNlXHJcbiAgICAgICAgKX1cIiBkZXNjcmlwdGlvbj1cIiR7ZW5jb2RlVVJJQ29tcG9uZW50KG1kLnJlbmRlcihkZXNjcmlwdGlvbikpfVwiPlxyXG4gIDx0ZW1wbGF0ZSAjc291cmNlPjxlcC0ke3NvdXJjZUZpbGUucmVwbGFjZUFsbCgnLycsICctJyl9Lz48L3RlbXBsYXRlPmBcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gJzwvRGVtbz5cXG4nXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVEZW1vQ29udGFpbmVyIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxhcHBcXFxccGVyc29ucy1kb2NcXFxcZG9jc1xcXFwudml0ZXByZXNzXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXGFwcFxcXFxwZXJzb25zLWRvY1xcXFxkb2NzXFxcXC52aXRlcHJlc3NcXFxccGx1Z2luc1xcXFxoZWFkZXJzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9hcHAvcGVyc29ucy1kb2MvZG9jcy8udml0ZXByZXNzL3BsdWdpbnMvaGVhZGVycy50c1wiO2ltcG9ydCB7IHJlc29sdmVIZWFkZXJzRnJvbVRva2Vucywgc2x1Z2lmeSB9IGZyb20gJ0BtZGl0LXZ1ZS9zaGFyZWQnXG5pbXBvcnQgdHlwZSB7IE1hcmtkb3duUmVuZGVyZXIgfSBmcm9tICd2aXRlcHJlc3MnXG5cbi8qKlxuICogR2V0IG1hcmtkb3duIGhlYWRlcnMgaW5mb1xuICpcbiAqIEV4dHJhY3QgdGhlbSBpbnRvIGVudlxuICovXG5leHBvcnQgZGVmYXVsdCAobWQ6IE1hcmtkb3duUmVuZGVyZXIpOiB2b2lkID0+IHtcbiAgLy8gZXh0cmFjdCBoZWFkZXJzIHRvIGVudlxuICBjb25zdCByZW5kZXIgPSBtZC5yZW5kZXJlci5yZW5kZXIuYmluZChtZC5yZW5kZXJlcilcblxuICBjb25zdCBsZXZlbCA9IFsyLCAzLCA0LCA1LCA2XVxuICBtZC5yZW5kZXJlci5yZW5kZXIgPSAodG9rZW5zLCBvcHRpb25zLCBlbnYpID0+IHtcbiAgICBlbnYuaGVhZGVycyA9IHJlc29sdmVIZWFkZXJzRnJvbVRva2Vucyh0b2tlbnMsIHtcbiAgICAgIGxldmVsLFxuICAgICAgc2hvdWxkQWxsb3dIdG1sOiB0cnVlLFxuICAgICAgc2hvdWxkQWxsb3dOZXN0ZWQ6IGZhbHNlLFxuICAgICAgc2hvdWxkRXNjYXBlVGV4dDogZmFsc2UsXG4gICAgICBzbHVnaWZ5LFxuICAgIH0pXG4gICAgLy8gcmVtb3ZlIHNwYWNlIGJlZm9yZSA8XG4gICAgZW52LmhlYWRlcnMuZm9yRWFjaCgoaGVhZGVyKSA9PiB7XG4gICAgICBoZWFkZXIudGl0bGUgPSBoZWFkZXIudGl0bGUucmVwbGFjZSgvXFxzKzwvZywgJzwnKVxuICAgIH0pXG4gICAgcmV0dXJuIHJlbmRlcih0b2tlbnMsIG9wdGlvbnMsIGVudilcbiAgfVxufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxhcHBcXFxccGVyc29ucy1kb2NcXFxcZG9jc1xcXFwudml0ZXByZXNzXFxcXGNvbmZpZ1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcYXBwXFxcXHBlcnNvbnMtZG9jXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFxjb25maWdcXFxcaGVhZC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovYXBwL3BlcnNvbnMtZG9jL2RvY3MvLnZpdGVwcmVzcy9jb25maWcvaGVhZC50c1wiO2ltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgeyB2cFJvb3QgfSBmcm9tICcuLi8uLi9idWlsZC11dGlscydcbmltcG9ydCB7IGxhbmd1YWdlcyB9IGZyb20gJy4uL3V0aWxzL2xhbmcnXG5cbmltcG9ydCB0eXBlIHsgSGVhZENvbmZpZyB9IGZyb20gJ3ZpdGVwcmVzcydcblxuZXhwb3J0IGNvbnN0IGhlYWQ6IEhlYWRDb25maWdbXSA9IFtcbiAgW1xuICAgICdsaW5rJyxcbiAgICB7XG4gICAgICByZWw6ICdpY29uJyxcbiAgICAgIGhyZWY6ICcvaW1hZ2VzL2VsZW1lbnQtcGx1cy1sb2dvLXNtYWxsLnN2ZycsXG4gICAgICB0eXBlOiAnaW1hZ2Uvc3ZnK3htJyxcbiAgICB9LFxuICBdLFxuICBbXG4gICAgJ2xpbmsnLFxuICAgIHtcbiAgICAgIHJlbDogJ2FwcGxlLXRvdWNoLWljb24nLFxuICAgICAgaHJlZjogJy9hcHBsZS10b3VjaC1pY29uLnBuZycsXG4gICAgICBzaXplczogJzE4MHgxODAnLFxuICAgIH0sXG4gIF0sXG4gIFtcbiAgICAnbGluaycsXG4gICAge1xuICAgICAgcmVsOiAnbWFzay1pY29uJyxcbiAgICAgIGhyZWY6ICcvc2FmYXJpLXBpbm5lZC10YWIuc3ZnJyxcbiAgICAgIGNvbG9yOiAnIzViYmFkNScsXG4gICAgfSxcbiAgXSxcbiAgW1xuICAgICdtZXRhJyxcbiAgICB7XG4gICAgICBuYW1lOiAndGhlbWUtY29sb3InLFxuICAgICAgY29udGVudDogJyNmZmZmZmYnLFxuICAgIH0sXG4gIF0sXG4gIFtcbiAgICAnbWV0YScsXG4gICAge1xuICAgICAgbmFtZTogJ21zYXBwbGljYXRpb24tVGlsZUNvbG9yJyxcbiAgICAgIGNvbnRlbnQ6ICcjNDA5ZWZmJyxcbiAgICB9LFxuICBdLFxuICBbXG4gICAgJ21ldGEnLFxuICAgIHtcbiAgICAgIG5hbWU6ICdtc2FwcGxpY2F0aW9uLWNvbmZpZycsXG4gICAgICBjb250ZW50OiAnL2Jyb3dzZXJjb25maWcueG1sJyxcbiAgICB9LFxuICBdLFxuICBbXG4gICAgJ21ldGEnLFxuICAgIHtcbiAgICAgIHByb3BlcnR5OiAnb2c6aW1hZ2UnLFxuICAgICAgY29udGVudDogJy9pbWFnZXMvZWxlbWVudC1wbHVzLW9nLWltYWdlLnBuZycsXG4gICAgfSxcbiAgXSxcbiAgW1xuICAgICdtZXRhJyxcbiAgICB7XG4gICAgICBwcm9wZXJ0eTogJ29nOmltYWdlOndpZHRoJyxcbiAgICAgIGNvbnRlbnQ6ICcxMjAwJyxcbiAgICB9LFxuICBdLFxuICBbXG4gICAgJ21ldGEnLFxuICAgIHtcbiAgICAgIHByb3BlcnR5OiAnb2c6aW1hZ2U6aGVpZ2h0JyxcbiAgICAgIGNvbnRlbnQ6ICc2MzAnLFxuICAgIH0sXG4gIF0sXG4gIFtcbiAgICAnbWV0YScsXG4gICAge1xuICAgICAgcHJvcGVydHk6ICdvZzpkZXNjcmlwdGlvbicsXG4gICAgICBjb250ZW50OiAnQSBWdWUgMyBiYXNlZCBjb21wb25lbnQgbGlicmFyeSBmb3IgZGVzaWduZXJzIGFuZCBkZXZlbG9wZXJzJyxcbiAgICB9LFxuICBdLFxuICBbXG4gICAgJ21ldGEnLFxuICAgIHtcbiAgICAgIG5hbWU6ICdiYWlkdS1zaXRlLXZlcmlmaWNhdGlvbicsXG4gICAgICBjb250ZW50OiAnY29kZXZhLXE1Z0J4WWNmT3MnLFxuICAgIH0sXG4gIF0sXG4gIFtcbiAgICAnc2NyaXB0JyxcbiAgICB7fSxcbiAgICBgOygoKSA9PiB7XG4gICAgICB3aW5kb3cuc3VwcG9ydGVkTGFuZ3MgPSAke0pTT04uc3RyaW5naWZ5KGxhbmd1YWdlcyl9XG4gICAgfSkoKWAsXG4gIF0sXG5cbiAgWydzY3JpcHQnLCB7fSwgZnMucmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZSh2cFJvb3QsICdsYW5nLmpzJyksICd1dGYtOCcpXSxcbiAgW1xuICAgICdzY3JpcHQnLFxuICAgIHtcbiAgICAgIGFzeW5jOiAndHJ1ZScsXG4gICAgICBzcmM6ICdodHRwczovL3d3dy5nb29nbGV0YWdtYW5hZ2VyLmNvbS9ndGFnL2pzP2lkPVVBLTE3NTMzNzk4OS0xJyxcbiAgICB9LFxuICBdLFxuICBbXG4gICAgJ3NjcmlwdCcsXG4gICAge30sXG4gICAgYGlmICgnc2VydmljZVdvcmtlcicgaW4gbmF2aWdhdG9yKSB7XG4gICAgICBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlclxuICAgICAgICAucmVnaXN0ZXIoJy9zdy5qcycpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlZ2lzdHJhdGlvbikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKHJlZ2lzdHJhdGlvbik7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICB9KTtcbiAgICB9YCxcbiAgXSxcbiAgW1xuICAgICdzY3JpcHQnLFxuICAgIHtcbiAgICAgIGFzeW5jOiAndHJ1ZScsXG4gICAgfSxcbiAgICBgd2luZG93LmRhdGFMYXllciA9IHdpbmRvdy5kYXRhTGF5ZXIgfHwgW107XG5mdW5jdGlvbiBndGFnKCl7ZGF0YUxheWVyLnB1c2goYXJndW1lbnRzKTt9XG5ndGFnKCdqcycsIG5ldyBEYXRlKCkpO1xuZ3RhZygnY29uZmlnJywgJ1VBLTE3NTMzNzk4OS0xJyk7YCxcbiAgXSxcbiAgW1xuICAgICdzY3JpcHQnLFxuICAgIHtcbiAgICAgIGFzeW5jOiAndHJ1ZScsXG4gICAgICBzcmM6ICdodHRwczovL3d3dy5nb29nbGV0YWdtYW5hZ2VyLmNvbS9ndGFnL2pzP2lkPUctTTc0WkhFUTFNMScsXG4gICAgfSxcbiAgXSxcbiAgW1xuICAgICdzY3JpcHQnLFxuICAgIHt9LFxuICAgIGBcbiAgICAgIHdpbmRvdy5kYXRhTGF5ZXIgPSB3aW5kb3cuZGF0YUxheWVyIHx8IFtdO1xuICAgICAgZnVuY3Rpb24gZ3RhZygpe2RhdGFMYXllci5wdXNoKGFyZ3VtZW50cyk7fVxuICAgICAgZ3RhZygnanMnLCBuZXcgRGF0ZSgpKTtcblxuICAgICAgZ3RhZygnY29uZmlnJywgJ0ctTTc0WkhFUTFNMScpO1xuICAgIGAsXG4gIF0sXG4gIFtcbiAgICAnc2NyaXB0JyxcbiAgICB7XG4gICAgICBhc3luYzogJ3RydWUnLFxuICAgIH0sXG4gICAgYFxuICB2YXIgcmVzb3VyY2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gIHJlc291cmNlLnNldEF0dHJpYnV0ZShcInJlbFwiLCBcInN0eWxlc2hlZXRcIik7XG4gIHJlc291cmNlLnNldEF0dHJpYnV0ZShcImhyZWZcIixcImh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzP2ZhbWlseT1JbnRlcjozMDAsNDAwLDUwMCw2MDAsNzAwLDgwMHxPcGVuK1NhbnM6NDAwLDYwMDtkaXNwbGF5PXN3YXBcIik7XG4gIHJlc291cmNlLnNldEF0dHJpYnV0ZShcInR5cGVcIixcInRleHQvY3NzXCIpO1xuICB2YXIgaGVhZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2hlYWQnKTtcbiAgaGVhZC5hcHBlbmRDaGlsZChyZXNvdXJjZSk7XG4gICAgYCxcbiAgXSxcbl1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcYXBwXFxcXHBlcnNvbnMtZG9jXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFxjb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXGFwcFxcXFxwZXJzb25zLWRvY1xcXFxkb2NzXFxcXC52aXRlcHJlc3NcXFxcY29uZmlnXFxcXG5hdi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovYXBwL3BlcnNvbnMtZG9jL2RvY3MvLnZpdGVwcmVzcy9jb25maWcvbmF2LnRzXCI7aW1wb3J0IHsgaXNFeHRlcm5hbCB9IGZyb20gJ3ZpdGVwcmVzcy9kaXN0L2NsaWVudC9zaGFyZWQnXG5pbXBvcnQgeyBlbnN1cmVMYW5nIH0gZnJvbSAnLi4vdXRpbHMvbGFuZydcbmltcG9ydCBuYXZMb2NhbGUgZnJvbSAnLi4vaTE4bi9wYWdlcy9zaWRlYmFyLmpzb24nXG5cbi8vIE1hcHBpbmcgdGhlIGZpcnN0IHN1YiBsaW5rIHRvIHRoZSBuYXYgbGluayB0byBhdm9pZCA0MDQgZXJyb3IuXG5cbmZ1bmN0aW9uIGdldE5hdigpIHtcbiAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhcbiAgICBPYmplY3QuZW50cmllcyhuYXZMb2NhbGUpLm1hcCgoW2xhbmcsIGxvY2FsZXNdKSA9PiB7XG4gICAgICBjb25zdCBpdGVtOiB7XG4gICAgICAgIGxpbms6IHN0cmluZ1xuICAgICAgICB0ZXh0OiBzdHJpbmdcbiAgICAgICAgYWN0aXZlTWF0Y2g/OiBzdHJpbmdcbiAgICAgIH1bXSA9IE9iamVjdC52YWx1ZXMobG9jYWxlcykubWFwKChpdGVtKSA9PiAoe1xuICAgICAgICAuLi5pdGVtLFxuICAgICAgICBsaW5rOiBgJHtpc0V4dGVybmFsKGl0ZW0ubGluaykgPyAnJyA6IGVuc3VyZUxhbmcobGFuZyl9JHtpdGVtLmxpbmt9YCxcbiAgICAgIH0pKVxuXG4gICAgICByZXR1cm4gW2xhbmcsIGl0ZW1dXG4gICAgfSlcbiAgKVxufVxuXG5leHBvcnQgY29uc3QgbmF2ID0gZ2V0TmF2KClcbiIsICJ7XG4gIFwiZW4tVVNcIjogW1xuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcImphdmFcIixcbiAgICAgIFwibGlua1wiOiBcIi9qYXZhL2VudlwiLFxuICAgICAgXCJhY3RpdmVNYXRjaFwiOiBcIi9qYXZhL1wiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJzeXN0ZW1cIixcbiAgICAgIFwibGlua1wiOiBcIi9zeXN0ZW0vbGludXgvY29tbW9uLWNvbW1hbmRzXCIsXG4gICAgICBcImFjdGl2ZU1hdGNoXCI6IFwiL3N5c3RlbS9cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiVnVlXCIsXG4gICAgICBcImxpbmtcIjogXCIvdnVlL2VjaGFydHMtbGluZVwiLFxuICAgICAgXCJhY3RpdmVNYXRjaFwiOiBcIi92dWUvXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIlx1NjU3MFx1NjM2RVx1NUU5M1wiLFxuICAgICAgXCJsaW5rXCI6IFwiL2RhdGFiYXNlL3Bvc3RncmVzL3Bvc3RncmVzLWluc3RhbGxcIixcbiAgICAgIFwiYWN0aXZlTWF0Y2hcIjogXCIvZGF0YWJhc2UvXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIlx1NEUyRFx1OTVGNFx1NEVGNlwiLFxuICAgICAgXCJsaW5rXCI6IFwiL21pZGRsZXdhcmUvdG9tY2F0L2Jhc2VcIixcbiAgICAgIFwiYWN0aXZlTWF0Y2hcIjogXCIvbWlkZGxld2FyZS9cIlxuICAgIH1cbiAgXVxufSIsICJ7XG4gIFwiZW4tVVNcIjoge1xuICAgIFwiZW52XCI6IHtcbiAgICAgIFwidGV4dFwiOiBcIlx1NUZFQlx1OTAxRlx1NUYwMFx1NTlDQlwiLFxuICAgICAgXCJiYXNlXCI6IFwiL2phdmEvXCIsXG4gICAgICBcImNoaWxkcmVuXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwidGV4dFwiOiBcIlx1NzNBRlx1NTg4M1x1NjQyRFx1NUVGQVwiLFxuICAgICAgICAgIFwibGlua1wiOiBcImVudlwiXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiY29tbW9ubHktdXNlZFwiOiB7XG4gICAgICBcInRleHRcIjogXCJcdTVFMzhcdTc1MjhcdTRFRTNcdTc4MDFcIixcbiAgICAgIFwiYmFzZVwiOiBcIi9qYXZhL2NvbW1vbmx5LXVzZWQvXCIsXG4gICAgICBcImNoaWxkcmVuXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwidGV4dFwiOiBcIkpTT05cIixcbiAgICAgICAgICBcImxpbmtcIjogXCJqc29uXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwidGV4dFwiOiBcIkV4Y2VsXCIsXG4gICAgICAgICAgXCJsaW5rXCI6IFwiZXhjZWxcIlxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcImJhc2ljXCI6IHtcbiAgICAgIFwidGV4dFwiOiBcIkJhc2ljXCIsXG4gICAgICBcImNoaWxkcmVuXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi9idXR0b25cIixcbiAgICAgICAgICBcInRleHRcIjogXCJCdXR0b25cIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsaW5rXCI6IFwiL2JvcmRlclwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIkJvcmRlclwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImxpbmtcIjogXCIvY29sb3JcIixcbiAgICAgICAgICBcInRleHRcIjogXCJDb2xvclwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImxpbmtcIjogXCIvY29udGFpbmVyXCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiTGF5b3V0IENvbnRhaW5lclwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImxpbmtcIjogXCIvaWNvblwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIkljb25cIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsaW5rXCI6IFwiL2xheW91dFwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIkxheW91dFwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImxpbmtcIjogXCIvbGlua1wiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIkxpbmtcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsaW5rXCI6IFwiL3RleHRcIixcbiAgICAgICAgICBcInRleHRcIjogXCJUZXh0XCIsXG4gICAgICAgICAgXCJwcm9tb3Rpb25cIjogXCIyLjMuMFwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImxpbmtcIjogXCIvc2Nyb2xsYmFyXCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiU2Nyb2xsYmFyXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi9zcGFjZVwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIlNwYWNlXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi90eXBvZ3JhcGh5XCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiVHlwb2dyYXBoeVwiXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiY29uZmlndXJhdGlvblwiOiB7XG4gICAgICBcInRleHRcIjogXCJDb25maWd1cmF0aW9uXCIsXG4gICAgICBcImNoaWxkcmVuXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi9jb25maWctcHJvdmlkZXJcIixcbiAgICAgICAgICBcInRleHRcIjogXCJDb25maWcgUHJvdmlkZXJcIlxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcImZvcm1cIjoge1xuICAgICAgXCJ0ZXh0XCI6IFwiRm9ybVwiLFxuICAgICAgXCJjaGlsZHJlblwiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcImxpbmtcIjogXCIvYXV0b2NvbXBsZXRlXCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiQXV0b2NvbXBsZXRlXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi9jYXNjYWRlclwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIkNhc2NhZGVyXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi9jaGVja2JveFwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIkNoZWNrYm94XCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi9jb2xvci1waWNrZXJcIixcbiAgICAgICAgICBcInRleHRcIjogXCJDb2xvciBQaWNrZXJcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsaW5rXCI6IFwiL2RhdGUtcGlja2VyXCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiRGF0ZSBQaWNrZXJcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsaW5rXCI6IFwiL2RhdGV0aW1lLXBpY2tlclwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIkRhdGVUaW1lIFBpY2tlclwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImxpbmtcIjogXCIvZm9ybVwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIkZvcm1cIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsaW5rXCI6IFwiL2lucHV0XCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiSW5wdXRcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsaW5rXCI6IFwiL2lucHV0LW51bWJlclwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIklucHV0IE51bWJlclwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImxpbmtcIjogXCIvaW5wdXQtdGFnXCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiSW5wdXQgVGFnXCIsXG4gICAgICAgICAgXCJwcm9tb3Rpb25cIjogXCIyLjkuMFwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImxpbmtcIjogXCIvbWVudGlvblwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIk1lbnRpb25cIixcbiAgICAgICAgICBcInByb21vdGlvblwiOiBcIjIuOC4wXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi9yYWRpb1wiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIlJhZGlvXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi9yYXRlXCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiUmF0ZVwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImxpbmtcIjogXCIvc2VsZWN0XCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiU2VsZWN0XCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi9zZWxlY3QtdjJcIixcbiAgICAgICAgICBcInRleHRcIjogXCJWaXJ0dWFsaXplZCBTZWxlY3RcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsaW5rXCI6IFwiL3NsaWRlclwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIlNsaWRlclwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImxpbmtcIjogXCIvc3dpdGNoXCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiU3dpdGNoXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi90aW1lLXBpY2tlclwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIlRpbWUgUGlja2VyXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi90aW1lLXNlbGVjdFwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIlRpbWUgU2VsZWN0XCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi90cmFuc2ZlclwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIlRyYW5zZmVyXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi90cmVlLXNlbGVjdFwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIlRyZWVTZWxlY3RcIixcbiAgICAgICAgICBcInByb21vdGlvblwiOiBcIjIuMS44XCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi91cGxvYWRcIixcbiAgICAgICAgICBcInRleHRcIjogXCJVcGxvYWRcIlxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcImRhdGFcIjoge1xuICAgICAgXCJ0ZXh0XCI6IFwiRGF0YVwiLFxuICAgICAgXCJjaGlsZHJlblwiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcImxpbmtcIjogXCIvYXZhdGFyXCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiQXZhdGFyXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi9iYWRnZVwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIkJhZGdlXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi9jYWxlbmRhclwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIkNhbGVuZGFyXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi9jYXJkXCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiQ2FyZFwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImxpbmtcIjogXCIvY2Fyb3VzZWxcIixcbiAgICAgICAgICBcInRleHRcIjogXCJDYXJvdXNlbFwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImxpbmtcIjogXCIvY29sbGFwc2VcIixcbiAgICAgICAgICBcInRleHRcIjogXCJDb2xsYXBzZVwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImxpbmtcIjogXCIvZGVzY3JpcHRpb25zXCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiRGVzY3JpcHRpb25zXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi9lbXB0eVwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIkVtcHR5XCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi9pbWFnZVwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIkltYWdlXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi9pbmZpbml0ZS1zY3JvbGxcIixcbiAgICAgICAgICBcInRleHRcIjogXCJJbmZpbml0ZSBTY3JvbGxcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsaW5rXCI6IFwiL3BhZ2luYXRpb25cIixcbiAgICAgICAgICBcInRleHRcIjogXCJQYWdpbmF0aW9uXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi9wcm9ncmVzc1wiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIlByb2dyZXNzXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi9yZXN1bHRcIixcbiAgICAgICAgICBcInRleHRcIjogXCJSZXN1bHRcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsaW5rXCI6IFwiL3NrZWxldG9uXCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiU2tlbGV0b25cIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsaW5rXCI6IFwiL3RhYmxlXCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiVGFibGVcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsaW5rXCI6IFwiL3RhYmxlLXYyXCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiVmlydHVhbGl6ZWQgVGFibGVcIixcbiAgICAgICAgICBcInByb21vdGlvblwiOiBcIjIuMi4wXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi90YWdcIixcbiAgICAgICAgICBcInRleHRcIjogXCJUYWdcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsaW5rXCI6IFwiL3RpbWVsaW5lXCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiVGltZWxpbmVcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsaW5rXCI6IFwiL3RvdXJcIixcbiAgICAgICAgICBcInRleHRcIjogXCJUb3VyXCIsXG4gICAgICAgICAgXCJwcm9tb3Rpb25cIjogXCIyLjUuMFwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImxpbmtcIjogXCIvdHJlZVwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIlRyZWVcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsaW5rXCI6IFwiL3RyZWUtdjJcIixcbiAgICAgICAgICBcInRleHRcIjogXCJWaXJ0dWFsaXplZCBUcmVlXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi9zdGF0aXN0aWNcIixcbiAgICAgICAgICBcInRleHRcIjogXCJTdGF0aXN0aWNcIixcbiAgICAgICAgICBcInByb21vdGlvblwiOiBcIjIuMi4zMFwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImxpbmtcIjogXCIvc2VnbWVudGVkXCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiU2VnbWVudGVkXCIsXG4gICAgICAgICAgXCJwcm9tb3Rpb25cIjogXCIyLjcuMFwiXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwibmF2aWdhdGlvblwiOiB7XG4gICAgICBcInRleHRcIjogXCJOYXZpZ2F0aW9uXCIsXG4gICAgICBcImNoaWxkcmVuXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi9hZmZpeFwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIkFmZml4XCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi9hbmNob3JcIixcbiAgICAgICAgICBcInRleHRcIjogXCJBbmNob3JcIixcbiAgICAgICAgICBcInByb21vdGlvblwiOiBcIjIuNi4wXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi9iYWNrdG9wXCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiQmFja3RvcFwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImxpbmtcIjogXCIvYnJlYWRjcnVtYlwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIkJyZWFkY3J1bWJcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsaW5rXCI6IFwiL2Ryb3Bkb3duXCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiRHJvcGRvd25cIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsaW5rXCI6IFwiL21lbnVcIixcbiAgICAgICAgICBcInRleHRcIjogXCJNZW51XCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi9wYWdlLWhlYWRlclwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIlBhZ2UgSGVhZGVyXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi9zdGVwc1wiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIlN0ZXBzXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi90YWJzXCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiVGFic1wiXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiZmVlZGJhY2tcIjoge1xuICAgICAgXCJ0ZXh0XCI6IFwiRmVlZGJhY2tcIixcbiAgICAgIFwiY2hpbGRyZW5cIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJsaW5rXCI6IFwiL2FsZXJ0XCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiQWxlcnRcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsaW5rXCI6IFwiL2RpYWxvZ1wiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIkRpYWxvZ1wiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImxpbmtcIjogXCIvZHJhd2VyXCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiRHJhd2VyXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi9sb2FkaW5nXCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiTG9hZGluZ1wiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImxpbmtcIjogXCIvbWVzc2FnZVwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIk1lc3NhZ2VcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsaW5rXCI6IFwiL21lc3NhZ2UtYm94XCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiTWVzc2FnZSBCb3hcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsaW5rXCI6IFwiL25vdGlmaWNhdGlvblwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIk5vdGlmaWNhdGlvblwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImxpbmtcIjogXCIvcG9wY29uZmlybVwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIlBvcGNvbmZpcm1cIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsaW5rXCI6IFwiL3BvcG92ZXJcIixcbiAgICAgICAgICBcInRleHRcIjogXCJQb3BvdmVyXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGlua1wiOiBcIi90b29sdGlwXCIsXG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiVG9vbHRpcFwiXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwib3RoZXJzXCI6IHtcbiAgICAgIFwidGV4dFwiOiBcIk90aGVyc1wiLFxuICAgICAgXCJjaGlsZHJlblwiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcImxpbmtcIjogXCIvZGl2aWRlclwiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIkRpdmlkZXJcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsaW5rXCI6IFwiL3dhdGVybWFya1wiLFxuICAgICAgICAgIFwidGV4dFwiOiBcIldhdGVybWFya1wiLFxuICAgICAgICAgIFwicHJvbW90aW9uXCI6IFwiMi40LjBcIlxuICAgICAgICB9XG4gICAgICBdXG4gICAgfVxuICB9XG59IiwgIntcbiAgXCJlbi1VU1wiOiB7XG4gICAgXCJlbnZcIjoge1xuICAgICAgXCJ0ZXh0XCI6IFwiXHU1RkVCXHU5MDFGXHU1RjAwXHU1OUNCXCIsXG4gICAgICBcImJhc2VcIjogXCIvcnVzdC9cIixcbiAgICAgIFwiY2hpbGRyZW5cIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiXHU1RkVCXHU5MDFGXHU1RjAwXHU1OUNCXCIsXG4gICAgICAgICAgXCJsaW5rXCI6IFwicnVzdC1zdGFydC1xdWlja2x5XCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwidGV4dFwiOiBcImNhcmdvXCIsXG4gICAgICAgICAgXCJsaW5rXCI6IFwiY2FyZ29cIlxuICAgICAgICB9XG4gICAgICBdXG4gICAgfVxuICB9XG59IiwgIntcbiAgXCJlbi1VU1wiOiB7XG4gICAgXCJzeXN0ZW1cIjoge1xuICAgICAgXCJ0ZXh0XCI6IFwiU3lzdGVtXCIsXG4gICAgICBcImJhc2VcIjogXCIvc3lzdGVtL2xpbnV4L1wiLFxuICAgICAgXCJjaGlsZHJlblwiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInRleHRcIjogXCJcdTVFMzhcdTc1MjhcdTU0N0RcdTRFRTRcIixcbiAgICAgICAgICBcImxpbmtcIjogXCJjb21tb24tY29tbWFuZHNcIlxuICAgICAgICB9XG4gICAgICBdXG4gICAgfVxuICB9XG59IiwgIntcbiAgXCJlbi1VU1wiOiB7XG4gICAgXCJlY2hhcnRzXCI6IHtcbiAgICAgIFwidGV4dFwiOiBcIkVjaGFydHNcIixcbiAgICAgIFwiYmFzZVwiOiBcIi92dWUvZWNoYXJ0cy1cIixcbiAgICAgIFwiY2hpbGRyZW5cIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiXHU2Mjk4XHU3RUJGXHU1NkZFXCIsXG4gICAgICAgICAgXCJsaW5rXCI6IFwibGluZVwiXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9XG4gIH1cbn0iLCAie1xuICBcImVuLVVTXCI6IHtcbiAgICBcInBvc3RncmVzXCI6IHtcbiAgICAgIFwidGV4dFwiOiBcIlBvc3RncmVzXCIsXG4gICAgICBcImJhc2VcIjogXCIvZGF0YWJhc2UvcG9zdGdyZXMvXCIsXG4gICAgICBcImNoaWxkcmVuXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwidGV4dFwiOiBcIlx1NUI4OVx1ODhDNVwiLFxuICAgICAgICAgIFwibGlua1wiOiBcInBvc3RncmVzLWluc3RhbGxcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ0ZXh0XCI6IFwicGctc3FsXCIsXG4gICAgICAgICAgXCJsaW5rXCI6IFwicG9zdGdyZXMtc3FsXCJcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH1cbiAgfVxufSIsICJ7XG4gIFwiZW4tVVNcIjoge1xuICAgIFwidG9tY2F0XCI6IHtcbiAgICAgIFwidGV4dFwiOiBcIlRvbWNhdFwiLFxuICAgICAgXCJiYXNlXCI6IFwiL21pZGRsZXdhcmUvdG9tY2F0L1wiLFxuICAgICAgXCJjaGlsZHJlblwiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInRleHRcIjogXCJcdTU3RkFcdTc4NDBcIixcbiAgICAgICAgICBcImxpbmtcIjogXCJiYXNlXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwidGV4dFwiOiBcIkhUVFBTXCIsXG4gICAgICAgICAgXCJsaW5rXCI6IFwiaHR0cHNcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ0ZXh0XCI6IFwiXHU0RjE4XHU1MzE2XCIsXG4gICAgICAgICAgXCJsaW5rXCI6IFwib3B0aW1pemF0aW9uXCJcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH1cbiAgfVxufSIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcYXBwXFxcXHBlcnNvbnMtZG9jXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFxjb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXGFwcFxcXFxwZXJzb25zLWRvY1xcXFxkb2NzXFxcXC52aXRlcHJlc3NcXFxcY29uZmlnXFxcXHNpZGViYXJzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9hcHAvcGVyc29ucy1kb2MvZG9jcy8udml0ZXByZXNzL2NvbmZpZy9zaWRlYmFycy50c1wiO2ltcG9ydCB7IGVuc3VyZUxhbmcgfSBmcm9tICcuLi91dGlscy9sYW5nJ1xuaW1wb3J0IGphdmFMb2NhbGUgZnJvbSAnLi4vaTE4bi9wYWdlcy9qYXZhLmpzb24nXG5pbXBvcnQgcnVzdExvY2FsZSBmcm9tICcuLi9pMThuL3BhZ2VzL3J1c3QuanNvbidcbmltcG9ydCBzeXN0ZW1Mb2NhbGUgZnJvbSAnLi4vaTE4bi9wYWdlcy9zeXN0ZW0uanNvbidcbmltcG9ydCB2dWVMb2NhbGUgZnJvbSAnLi4vaTE4bi9wYWdlcy92dWUuanNvbidcbmltcG9ydCBkYXRhYmFzZUxvY2FsZSBmcm9tICcuLi9pMThuL3BhZ2VzL2RhdGFiYXNlLmpzb24nXG5pbXBvcnQgbWlkZGxld2FyZUxvY2FsZSBmcm9tICcuLi9pMThuL3BhZ2VzL21pZGRsZXdhcmUuanNvbidcblxuZnVuY3Rpb24gZ2V0SmF2YVNpZGViYXIoKSB7XG4gIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgT2JqZWN0LmVudHJpZXMoamF2YUxvY2FsZSkubWFwKChbbGFuZywgdmFsXSkgPT4gW1xuICAgICAgbGFuZyxcbiAgICAgIE9iamVjdC52YWx1ZXModmFsKS5tYXAoKGl0ZW0pID0+IG1hcFByZWZpeChpdGVtLCBsYW5nLCAnYmFzZScgaW4gaXRlbSA/IGl0ZW0uYmFzZSA6ICcnKSksXG4gICAgXSlcbiAgKVxufVxuXG5mdW5jdGlvbiBnZXRSdXN0U2lkZWJhcigpIHtcbiAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhcbiAgICBPYmplY3QuZW50cmllcyhydXN0TG9jYWxlKS5tYXAoKFtsYW5nLCB2YWxdKSA9PiBbXG4gICAgICBsYW5nLFxuICAgICAgT2JqZWN0LnZhbHVlcyh2YWwpLm1hcCgoaXRlbSkgPT4gbWFwUHJlZml4KGl0ZW0sIGxhbmcsICdiYXNlJyBpbiBpdGVtID8gaXRlbS5iYXNlIDogJycpKSxcbiAgICBdKVxuICApXG59XG5cbmZ1bmN0aW9uIGdldFN5c3RlbVNpZGViYXIoKSB7XG4gIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgT2JqZWN0LmVudHJpZXMoc3lzdGVtTG9jYWxlKS5tYXAoKFtsYW5nLCB2YWxdKSA9PiBbXG4gICAgICBsYW5nLFxuICAgICAgT2JqZWN0LnZhbHVlcyh2YWwpLm1hcCgoaXRlbSkgPT4gbWFwUHJlZml4KGl0ZW0sIGxhbmcsIGl0ZW0uYmFzZSkpLFxuICAgIF0pXG4gIClcbn1cblxuZnVuY3Rpb24gZ2V0RGF0YWJhc2VTaWRlQmFyKCkge1xuICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgIE9iamVjdC5lbnRyaWVzKGRhdGFiYXNlTG9jYWxlKS5tYXAoKFtsYW5nLCB2YWxdKSA9PiBbXG4gICAgICBsYW5nLFxuICAgICAgT2JqZWN0LnZhbHVlcyh2YWwpLm1hcCgoaXRlbSkgPT4gbWFwUHJlZml4KGl0ZW0sIGxhbmcsIGl0ZW0uYmFzZSkpLFxuICAgIF0pXG4gIClcbn1cblxuZnVuY3Rpb24gZ2V0VnVlU2lkZUJhcigpIHtcbiAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhcbiAgICBPYmplY3QuZW50cmllcyh2dWVMb2NhbGUpLm1hcCgoW2xhbmcsIHZhbF0pID0+IFtcbiAgICAgIGxhbmcsXG4gICAgICBPYmplY3QudmFsdWVzKHZhbCkubWFwKChpdGVtKSA9PiBtYXBQcmVmaXgoaXRlbSwgbGFuZywgaXRlbS5iYXNlKSksXG4gICAgXSlcbiAgKVxufVxuXG5mdW5jdGlvbiBnZXRNaWRkbGV3YXJlU2lkZUJhcigpIHtcbiAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhcbiAgICBPYmplY3QuZW50cmllcyhtaWRkbGV3YXJlTG9jYWxlKS5tYXAoKFtsYW5nLCB2YWxdKSA9PiBbXG4gICAgICBsYW5nLFxuICAgICAgT2JqZWN0LnZhbHVlcyh2YWwpLm1hcCgoaXRlbSkgPT4gbWFwUHJlZml4KGl0ZW0sIGxhbmcsIGl0ZW0uYmFzZSkpLFxuICAgIF0pXG4gIClcbn1cblxuLy8gcmV0dXJuIHNpZGViYXIgd2l0aCBsYW5ndWFnZSBjb25maWdzLlxuLy8gdGhpcyBtaWdodCBjcmVhdGUgZHVwbGljYXRlZCBkYXRhIGJ1dCB0aGUgb3ZlcmhlYWQgaXMgaWdub3JhYmxlXG5jb25zdCBnZXRTaWRlYmFycyA9ICgpID0+IHtcbiAgcmV0dXJuIHtcbiAgICAnL2phdmEvJzogZ2V0SmF2YVNpZGViYXIoKSxcbiAgICAnL3J1c3QvJzogZ2V0UnVzdFNpZGViYXIoKSxcbiAgICAnL3N5c3RlbS8nOiBnZXRTeXN0ZW1TaWRlYmFyKCksXG4gICAgJy92dWUvJzogZ2V0VnVlU2lkZUJhcigpLFxuICAgICcvZGF0YWJhc2UvJzogZ2V0RGF0YWJhc2VTaWRlQmFyKCksXG4gICAgJy9taWRkbGV3YXJlLyc6IGdldE1pZGRsZXdhcmVTaWRlQmFyKCksXG4gIH1cbn1cblxudHlwZSBJdGVtID0ge1xuICB0ZXh0OiBzdHJpbmdcbiAgY2hpbGRyZW4/OiBJdGVtW11cbiAgbGluaz86IHN0cmluZ1xufVxuXG5mdW5jdGlvbiBtYXBQcmVmaXgoaXRlbTogSXRlbSwgbGFuZzogc3RyaW5nLCBwcmVmaXggPSAnJykge1xuICBpZiAoaXRlbS5jaGlsZHJlbiAmJiBpdGVtLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uaXRlbSxcbiAgICAgIGNoaWxkcmVuOiBpdGVtLmNoaWxkcmVuLm1hcCgoY2hpbGQpID0+IG1hcFByZWZpeChjaGlsZCwgbGFuZywgcHJlZml4KSksXG4gICAgfVxuICB9XG4gIHJldHVybiB7XG4gICAgLi4uaXRlbSxcbiAgICBsaW5rOiBgJHtlbnN1cmVMYW5nKGxhbmcpfSR7cHJlZml4fSR7aXRlbS5saW5rfWAsXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHNpZGViYXJzID0gZ2V0U2lkZWJhcnMoKVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxhcHBcXFxccGVyc29ucy1kb2NcXFxcZG9jc1xcXFwudml0ZXByZXNzXFxcXGNvbmZpZ1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcYXBwXFxcXHBlcnNvbnMtZG9jXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFxjb25maWdcXFxcdml0ZS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovYXBwL3BlcnNvbnMtZG9jL2RvY3MvLnZpdGVwcmVzcy9jb25maWcvdml0ZS50c1wiO2ltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgSW5zcGVjdCBmcm9tICd2aXRlLXBsdWdpbi1pbnNwZWN0J1xuaW1wb3J0IFVub0NTUyBmcm9tICd1bm9jc3Mvdml0ZSdcbmltcG9ydCBta2NlcnQgZnJvbSAndml0ZS1wbHVnaW4tbWtjZXJ0J1xuaW1wb3J0IHZ1ZUpzeCBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUtanN4J1xuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSdcbmltcG9ydCBJY29ucyBmcm9tICd1bnBsdWdpbi1pY29ucy92aXRlJ1xuaW1wb3J0IEljb25zUmVzb2x2ZXIgZnJvbSAndW5wbHVnaW4taWNvbnMvcmVzb2x2ZXInXG5pbXBvcnQgeyBsb2FkRW52IH0gZnJvbSAndml0ZXByZXNzJ1xuaW1wb3J0IHsgZ3JvdXBJY29uVml0ZVBsdWdpbiB9IGZyb20gJ3ZpdGVwcmVzcy1wbHVnaW4tZ3JvdXAtaWNvbnMnXG5pbXBvcnQge1xuICBwcm9qUm9vdCxcbn0gZnJvbSAnLi4vLi4vYnVpbGQtdXRpbHMnXG5pbXBvcnQgeyBNYXJrZG93blRyYW5zZm9ybSB9IGZyb20gJy4uL3BsdWdpbnMvbWFya2Rvd24tdHJhbnNmb3JtJ1xuaW1wb3J0IHR5cGUgeyBQbHVnaW4sIFVzZXJDb25maWcgfSBmcm9tICd2aXRlcHJlc3MnXG5pbXBvcnQgbGxtc3R4dCBmcm9tICd2aXRlcHJlc3MtcGx1Z2luLWxsbXMnXG5cbnR5cGUgVml0ZUNvbmZpZyA9IFJlcXVpcmVkPFVzZXJDb25maWc+Wyd2aXRlJ11cblxuZXhwb3J0IGNvbnN0IGdldFZpdGVDb25maWcgPSAoeyBtb2RlIH06IHsgbW9kZTogc3RyaW5nIH0pOiBWaXRlQ29uZmlnID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJylcbiAgcmV0dXJuIHtcbiAgICBjc3M6IHtcbiAgICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgICAgc2Nzczoge1xuICAgICAgICAgIHNpbGVuY2VEZXByZWNhdGlvbnM6IFsnbGVnYWN5LWpzLWFwaSddLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgaG9zdDogdHJ1ZSxcbiAgICAgIGZzOiB7XG4gICAgICAgIGFsbG93OiBbcHJvalJvb3RdLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBmaW5kOiAnfi8nLFxuICAgICAgICAgIHJlcGxhY2VtZW50OiBgJHtwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vdml0ZXByZXNzJyl9L2AsXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIHZ1ZUpzeCgpLFxuXG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW50ZnUvdW5wbHVnaW4tdnVlLWNvbXBvbmVudHNcbiAgICAgIENvbXBvbmVudHMoe1xuICAgICAgICBkaXJzOiBbJy52aXRlcHJlc3Mvdml0ZXByZXNzL2NvbXBvbmVudHMnXSxcblxuICAgICAgICBhbGxvd092ZXJyaWRlczogdHJ1ZSxcblxuICAgICAgICAvLyBjdXN0b20gcmVzb2x2ZXJzXG4gICAgICAgIHJlc29sdmVyczogW1xuICAgICAgICAgIC8vIGF1dG8gaW1wb3J0IGljb25zXG4gICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FudGZ1L3VucGx1Z2luLWljb25zXG4gICAgICAgICAgSWNvbnNSZXNvbHZlcigpLFxuICAgICAgICBdLFxuXG4gICAgICAgIC8vIGFsbG93IGF1dG8gaW1wb3J0IGFuZCByZWdpc3RlciBjb21wb25lbnRzIHVzZWQgaW4gbWFya2Rvd25cbiAgICAgICAgaW5jbHVkZTogWy9cXC52dWUkLywgL1xcLnZ1ZVxcP3Z1ZS8sIC9cXC5tZCQvXSxcbiAgICAgIH0pLFxuXG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW50ZnUvdW5wbHVnaW4taWNvbnNcbiAgICAgIEljb25zKHtcbiAgICAgICAgYXV0b0luc3RhbGw6IHRydWUsXG4gICAgICB9KSxcblxuICAgICAgVW5vQ1NTKHtcbiAgICAgICAgaW5zcGVjdG9yOiBmYWxzZSxcbiAgICAgIH0pLFxuXG4gICAgICBNYXJrZG93blRyYW5zZm9ybSgpLFxuICAgICAgSW5zcGVjdCgpLFxuICAgICAgZ3JvdXBJY29uVml0ZVBsdWdpbigpLFxuICAgICAgbGxtc3R4dCh7XG4gICAgICAgIHdvcmtEaXI6ICd6aCcsXG4gICAgICAgIGlnbm9yZUZpbGVzOiBbJ2luZGV4Lm1kJ11cbiAgICAgIH0pLFxuICAgICAgZW52LkhUVFBTID8gKG1rY2VydCgpIGFzIFBsdWdpbikgOiB1bmRlZmluZWQsXG4gICAgXSxcbiAgICAvLyBcdTc4NkVcdTRGRERFbGVtZW50IFBsdXNcdTUzQ0FcdTUxNzZcdTU2RkVcdTY4MDdcdTg4QUJcdTZCNjNcdTc4NkVcdTU5MDRcdTc0MDZcbiAgICBvcHRpbWl6ZURlcHM6IHtcbiAgICAgIGluY2x1ZGU6IFsnZWxlbWVudC1wbHVzJywgJ0BlbGVtZW50LXBsdXMvaWNvbnMtdnVlJ11cbiAgICB9XG4gIH1cbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcYXBwXFxcXHBlcnNvbnMtZG9jXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxhcHBcXFxccGVyc29ucy1kb2NcXFxcZG9jc1xcXFwudml0ZXByZXNzXFxcXHBsdWdpbnNcXFxcbWFya2Rvd24tdHJhbnNmb3JtLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9hcHAvcGVyc29ucy1kb2MvZG9jcy8udml0ZXByZXNzL3BsdWdpbnMvbWFya2Rvd24tdHJhbnNmb3JtLnRzXCI7aW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IGNhbWVsaXplIH0gZnJvbSAnQHZ1ZS9zaGFyZWQnXG5pbXBvcnQgZ2xvYiBmcm9tICdmYXN0LWdsb2InXG5pbXBvcnQgeyBkb2NSb290LCBkb2NzRGlyTmFtZSwgcHJvalJvb3QgfSBmcm9tICcuLi8uLi9idWlsZC11dGlscydcbmltcG9ydCB7IGdldExhbmcsIGxhbmd1YWdlcyB9IGZyb20gJy4uL3V0aWxzL2xhbmcnXG5pbXBvcnQgZm9vdGVyTG9jYWxlIGZyb20gJy4uL2kxOG4vY29tcG9uZW50L2Zvb3Rlci5qc29uJ1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnXG5cbnR5cGUgQXBwZW5kID0gUmVjb3JkPCdoZWFkZXJzJyB8ICdmb290ZXJzJyB8ICdzY3JpcHRTZXR1cHMnLCBzdHJpbmdbXT5cblxubGV0IGNvbXBQYXRoczogc3RyaW5nW11cblxuZXhwb3J0IGZ1bmN0aW9uIE1hcmtkb3duVHJhbnNmb3JtKCk6IFBsdWdpbiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2VsZW1lbnQtcGx1cy1tZC10cmFuc2Zvcm0nLFxuXG4gICAgZW5mb3JjZTogJ3ByZScsXG5cbiAgICBhc3luYyBidWlsZFN0YXJ0KCkge1xuICAgICAgY29uc3QgcGF0dGVybiA9IGB7JHtbLi4ubGFuZ3VhZ2VzLCBsYW5ndWFnZXNbMF1dLmpvaW4oJywnKX19L2NvbXBvbmVudGBcblxuICAgICAgY29tcFBhdGhzID0gYXdhaXQgZ2xvYihwYXR0ZXJuLCB7XG4gICAgICAgIGN3ZDogZG9jUm9vdCxcbiAgICAgICAgYWJzb2x1dGU6IHRydWUsXG4gICAgICAgIG9ubHlEaXJlY3RvcmllczogdHJ1ZSxcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIGFzeW5jIHRyYW5zZm9ybShjb2RlLCBpZCkge1xuICAgICAgaWYgKCFpZC5lbmRzV2l0aCgnLm1kJykpIHJldHVyblxuXG4gICAgICBjb25zdCBjb21wb25lbnRJZCA9IHBhdGguYmFzZW5hbWUoaWQsICcubWQnKVxuICAgICAgY29uc3QgYXBwZW5kOiBBcHBlbmQgPSB7XG4gICAgICAgIGhlYWRlcnM6IFtdLFxuICAgICAgICBmb290ZXJzOiBbXSxcbiAgICAgICAgc2NyaXB0U2V0dXBzOiBnZXRFeGFtcGxlSW1wb3J0cyhjb21wb25lbnRJZCksXG4gICAgICB9XG5cbiAgICAgIGNvZGUgPSB0cmFuc2Zvcm1WcFNjcmlwdFNldHVwKGNvZGUsIGFwcGVuZClcblxuICAgICAgaWYgKGNvbXBQYXRocy5zb21lKChjb21wUGF0aCkgPT4gaWQuc3RhcnRzV2l0aChjb21wUGF0aCkpKSB7XG4gICAgICAgIGNvZGUgPSB0cmFuc2Zvcm1Db21wb25lbnRNYXJrZG93bihpZCwgY29tcG9uZW50SWQsIGNvZGUsIGFwcGVuZClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbWJpbmVNYXJrZG93bihcbiAgICAgICAgY29kZSxcbiAgICAgICAgW2NvbWJpbmVTY3JpcHRTZXR1cChhcHBlbmQuc2NyaXB0U2V0dXBzKSwgLi4uYXBwZW5kLmhlYWRlcnNdLFxuICAgICAgICBhcHBlbmQuZm9vdGVyc1xuICAgICAgKVxuICAgIH0sXG4gIH1cbn1cblxuY29uc3QgY29tYmluZVNjcmlwdFNldHVwID0gKGNvZGVzOiBzdHJpbmdbXSkgPT5cbiAgYFxcbjxzY3JpcHQgc2V0dXA+XG4ke2NvZGVzLmpvaW4oJ1xcbicpfVxuPC9zY3JpcHQ+XG5gXG5cbmNvbnN0IGNvbWJpbmVNYXJrZG93biA9IChcbiAgY29kZTogc3RyaW5nLFxuICBoZWFkZXJzOiBzdHJpbmdbXSxcbiAgZm9vdGVyczogc3RyaW5nW11cbikgPT4ge1xuICBjb25zdCBmcm9udG1hdHRlckVuZHMgPSBjb2RlLmluZGV4T2YoJy0tLVxcclxcblxcclxcbicpXG4gIGNvbnN0IGZpcnN0SGVhZGVyID0gY29kZS5zZWFyY2goL1xcbiN7MSw2fVxccy4rLylcbiAgY29uc3Qgc2xpY2VJbmRleCA9XG4gICAgZmlyc3RIZWFkZXIgPCAwXG4gICAgICA/IGZyb250bWF0dGVyRW5kcyA8IDBcbiAgICAgICAgPyAwXG4gICAgICAgIDogZnJvbnRtYXR0ZXJFbmRzICsgNFxuICAgICAgOiBmaXJzdEhlYWRlclxuXG4gIGlmIChoZWFkZXJzLmxlbmd0aCA+IDApXG4gICAgY29kZSA9XG4gICAgICBjb2RlLnNsaWNlKDAsIHNsaWNlSW5kZXgpICsgaGVhZGVycy5qb2luKCdcXG4nKSArIGNvZGUuc2xpY2Uoc2xpY2VJbmRleClcbiAgY29kZSArPSBmb290ZXJzLmpvaW4oJ1xcbicpXG5cbiAgcmV0dXJuIGAke2NvZGV9XFxuYFxufVxuXG5jb25zdCB2cFNjcmlwdFNldHVwUkUgPSAvPHZwLXNjcmlwdFxccyguKlxccyk/c2V0dXAoXFxzLiopPz4oW1xcc1xcU10qKTxcXC92cC1zY3JpcHQ+L1xuXG5jb25zdCB0cmFuc2Zvcm1WcFNjcmlwdFNldHVwID0gKGNvZGU6IHN0cmluZywgYXBwZW5kOiBBcHBlbmQpID0+IHtcbiAgY29uc3QgbWF0Y2hlcyA9IGNvZGUubWF0Y2godnBTY3JpcHRTZXR1cFJFKVxuICBpZiAobWF0Y2hlcykgY29kZSA9IGNvZGUucmVwbGFjZShtYXRjaGVzWzBdLCAnJylcbiAgY29uc3Qgc2NyaXB0U2V0dXAgPSBtYXRjaGVzPy5bM10gPz8gJydcbiAgaWYgKHNjcmlwdFNldHVwKSBhcHBlbmQuc2NyaXB0U2V0dXBzLnB1c2goc2NyaXB0U2V0dXApXG4gIHJldHVybiBjb2RlXG59XG5cbmNvbnN0IEdJVEhVQl9CTE9CX1VSTCA9IGBodHRwczovL2dpdGh1Yi5jb20vZWxlbWVudC1wbHVzL2VsZW1lbnQtcGx1cy9ibG9iL2RldmBcbmNvbnN0IEdJVEhVQl9UUkVFX1VSTCA9IGBodHRwczovL2dpdGh1Yi5jb20vZWxlbWVudC1wbHVzL2VsZW1lbnQtcGx1cy9ibG9iL2RldmBcbmNvbnN0IHRyYW5zZm9ybUNvbXBvbmVudE1hcmtkb3duID0gKFxuICBpZDogc3RyaW5nLFxuICBjb21wb25lbnRJZDogc3RyaW5nLFxuICBjb2RlOiBzdHJpbmcsXG4gIGFwcGVuZDogQXBwZW5kXG4pID0+IHtcbiAgY29uc3QgbGFuZyA9IGdldExhbmcoaWQpXG4gIGNvbnN0IGRvY1VybCA9IGAke0dJVEhVQl9CTE9CX1VSTH0vJHtkb2NzRGlyTmFtZX0vZW4tVVMvY29tcG9uZW50LyR7Y29tcG9uZW50SWR9Lm1kYFxuICBjb25zdCBjb21wb25lbnRVcmwgPSBgJHtHSVRIVUJfVFJFRV9VUkx9L3BhY2thZ2VzL2NvbXBvbmVudHMvJHtjb21wb25lbnRJZH1gXG4gIGNvbnN0IHN0eWxlVXJsID0gYCR7R0lUSFVCX1RSRUVfVVJMfS9wYWNrYWdlcy90aGVtZS1jaGFsay9zcmMvJHtjb21wb25lbnRJZH0uc2Nzc2BcblxuICBjb25zdCBjb21wb25lbnRQYXRoID0gcGF0aC5yZXNvbHZlKFxuICAgIHByb2pSb290LFxuICAgIGBwYWNrYWdlcy9jb21wb25lbnRzLyR7Y29tcG9uZW50SWR9YFxuICApXG4gIGNvbnN0IHN0eWxlUGF0aCA9IHBhdGgucmVzb2x2ZShcbiAgICBwcm9qUm9vdCxcbiAgICBgcGFja2FnZXMvdGhlbWUtY2hhbGsvc3JjLyR7Y29tcG9uZW50SWR9LnNjc3NgXG4gIClcblxuICBjb25zdCBpc0NvbXBvbmVudCA9IGZzLmV4aXN0c1N5bmMoY29tcG9uZW50UGF0aClcbiAgY29uc3QgaXNIYXZlQ29tcG9uZW50U3R5bGUgPSBmcy5leGlzdHNTeW5jKHN0eWxlUGF0aClcblxuICBjb25zdCBsaW5rcyA9IFtbZm9vdGVyTG9jYWxlW2xhbmddLmRvY3MsIGRvY1VybF1dXG5cbiAgaWYgKGlzQ29tcG9uZW50ICYmIGlzSGF2ZUNvbXBvbmVudFN0eWxlKVxuICAgIGxpbmtzLnVuc2hpZnQoW2Zvb3RlckxvY2FsZVtsYW5nXS5zdHlsZSwgc3R5bGVVcmxdKVxuXG4gIGlmIChpc0NvbXBvbmVudCkgbGlua3MudW5zaGlmdChbZm9vdGVyTG9jYWxlW2xhbmddLmNvbXBvbmVudCwgY29tcG9uZW50VXJsXSlcblxuICBjb25zdCBsaW5rc1RleHQgPSBsaW5rc1xuICAgIC5maWx0ZXIoKGkpID0+IGkpXG4gICAgLm1hcCgoW3RleHQsIGxpbmtdKSA9PiBgWyR7dGV4dH1dKCR7bGlua30pYClcbiAgICAuam9pbignIFx1MjAyMiAnKVxuXG4gIGNvbnN0IHNvdXJjZVNlY3Rpb24gPSBgXG4jIyAke2Zvb3RlckxvY2FsZVtsYW5nXS5zb3VyY2V9XG5cbiR7bGlua3NUZXh0fWBcblxuICBjb25zdCBjb250cmlidXRvcnNTZWN0aW9uID0gYFxuIyMgJHtmb290ZXJMb2NhbGVbbGFuZ10uY29udHJpYnV0b3JzfVxuXG48Q29udHJpYnV0b3JzIGlkPVwiJHtjb21wb25lbnRJZH1cIiAvPmBcblxuICBhcHBlbmQuZm9vdGVycy5wdXNoKHNvdXJjZVNlY3Rpb24sIGlzQ29tcG9uZW50ID8gY29udHJpYnV0b3JzU2VjdGlvbiA6ICcnKVxuXG4gIHJldHVybiBjb2RlXG59XG5cbmNvbnN0IGdldEV4YW1wbGVJbXBvcnRzID0gKGNvbXBvbmVudElkOiBzdHJpbmcpID0+IHtcbiAgY29uc3QgZXhhbXBsZVBhdGggPSBwYXRoLnJlc29sdmUoZG9jUm9vdCwgJ2V4YW1wbGVzJywgY29tcG9uZW50SWQpXG4gIGlmICghZnMuZXhpc3RzU3luYyhleGFtcGxlUGF0aCkpIHJldHVybiBbXVxuICBjb25zdCBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKGV4YW1wbGVQYXRoKVxuICBjb25zdCBpbXBvcnRzOiBzdHJpbmdbXSA9IFtdXG5cbiAgZm9yIChjb25zdCBpdGVtIG9mIGZpbGVzKSB7XG4gICAgaWYgKCEvXFwudnVlJC8udGVzdChpdGVtKSkgY29udGludWVcbiAgICBjb25zdCBmaWxlID0gaXRlbS5yZXBsYWNlKC9cXC52dWUkLywgJycpXG4gICAgY29uc3QgbmFtZSA9IGNhbWVsaXplKGBFcC0ke2NvbXBvbmVudElkfS0ke2ZpbGV9YClcblxuXG4gICAgaW1wb3J0cy5wdXNoKFxuICAgICAgYGltcG9ydCAke25hbWV9IGZyb20gJy4uLy4uL2V4YW1wbGVzLyR7Y29tcG9uZW50SWR9LyR7ZmlsZX0udnVlJ2BcbiAgICApXG4gIH1cblxuICByZXR1cm4gaW1wb3J0c1xufVxuIiwgIntcbiAgXCJlbi1VU1wiOiB7XG4gICAgXCJzb3VyY2VcIjogXCJTb3VyY2VcIixcbiAgICBcImNvbnRyaWJ1dG9yc1wiOiBcIkNvbnRyaWJ1dG9yc1wiLFxuICAgIFwiY29tcG9uZW50XCI6IFwiQ29tcG9uZW50XCIsXG4gICAgXCJzdHlsZVwiOiBcIlN0eWxlXCIsXG4gICAgXCJkb2NzXCI6IFwiRG9jc1wiXG4gIH1cbn0iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXGFwcFxcXFxwZXJzb25zLWRvY1xcXFxkb2NzXFxcXC52aXRlcHJlc3NcXFxcY29uZmlnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxhcHBcXFxccGVyc29ucy1kb2NcXFxcZG9jc1xcXFwudml0ZXByZXNzXFxcXGNvbmZpZ1xcXFx2dWUtY29tcGlsZXIudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L2FwcC9wZXJzb25zLWRvYy9kb2NzLy52aXRlcHJlc3MvY29uZmlnL3Z1ZS1jb21waWxlci50c1wiOy8vIFRPRE86IGRlbGV0ZSB0aGlzIGZpbGUgYWZ0ZXIgdXBncmFkaW5nIHZ1ZSBpbiByb290IHBhY2thZ2UuanNvblxuaW1wb3J0IHsgY3JlYXRlUmVxdWlyZSB9IGZyb20gJ25vZGU6bW9kdWxlJ1xuXG5jb25zdCBfcmVxdWlyZSA9IGNyZWF0ZVJlcXVpcmUoaW1wb3J0Lm1ldGEudXJsKVxuY29uc3Qgdml0ZXByZXNzUGF0aCA9IF9yZXF1aXJlLnJlc29sdmUoJ3ZpdGVwcmVzcycpXG5cbmV4cG9ydCBjb25zdCB2dWVDb21waWxlciA9IF9yZXF1aXJlKFxuICBfcmVxdWlyZS5yZXNvbHZlKCd2dWUvY29tcGlsZXItc2ZjJywgeyBwYXRoczogW3ZpdGVwcmVzc1BhdGhdIH0pXG4pXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXGFwcFxcXFxwZXJzb25zLWRvY1xcXFxkb2NzXFxcXC52aXRlcHJlc3NcXFxcY29uZmlnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxhcHBcXFxccGVyc29ucy1kb2NcXFxcZG9jc1xcXFwudml0ZXByZXNzXFxcXGNvbmZpZ1xcXFxpbmRleC5tdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L2FwcC9wZXJzb25zLWRvYy9kb2NzLy52aXRlcHJlc3MvY29uZmlnL2luZGV4Lm10c1wiO1xuaW1wb3J0IHR5cGUgeyBIZWFkQ29uZmlnLCBVc2VyQ29uZmlnIH0gZnJvbSAndml0ZXByZXNzJ1xuXG5pbXBvcnQgeyBsYW5ndWFnZXMgfSBmcm9tICcuLi91dGlscy9sYW5nJ1xuaW1wb3J0IHsgbWRQbHVnaW4gfSBmcm9tICcuL3BsdWdpbnMnXG5pbXBvcnQgeyBoZWFkIH0gZnJvbSAnLi9oZWFkJ1xuaW1wb3J0IHsgbmF2IH0gZnJvbSAnLi9uYXYnXG5pbXBvcnQgeyBzaWRlYmFycyB9IGZyb20gJy4vc2lkZWJhcnMnXG5pbXBvcnQgeyBnZXRWaXRlQ29uZmlnIH0gZnJvbSAnLi92aXRlJ1xuaW1wb3J0IHsgdnVlQ29tcGlsZXIgfSBmcm9tICcuL3Z1ZS1jb21waWxlcidcblxuY29uc3QgcHJvZCA9ICEhcHJvY2Vzcy5lbnYuTkVUTElGWVxuXG5jb25zdCBidWlsZFRyYW5zZm9ybWVycyA9ICgpID0+IHtcbiAgY29uc3QgdHJhbnNmb3JtZXIgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb3BzOiBbXSxcbiAgICAgIG5lZWRSdW50aW1lOiB0cnVlLFxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHRyYW5zZm9ybWVycyA9IHt9XG4gIGNvbnN0IGRpcmVjdGl2ZXMgPSBbXG4gICAgJ2luZmluaXRlLXNjcm9sbCcsXG4gICAgJ2xvYWRpbmcnLFxuICAgICdwb3BvdmVyJyxcbiAgICAnY2xpY2stb3V0c2lkZScsXG4gICAgJ3JlcGVhdC1jbGljaycsXG4gICAgJ3RyYXAtZm9jdXMnLFxuICAgICdtb3VzZXdoZWVsJyxcbiAgICAncmVzaXplJyxcbiAgXVxuICBkaXJlY3RpdmVzLmZvckVhY2goKGspID0+IHtcbiAgICB0cmFuc2Zvcm1lcnNba10gPSB0cmFuc2Zvcm1lclxuICB9KVxuXG4gIHJldHVybiB0cmFuc2Zvcm1lcnNcbn1cblxuY29uc3QgbG9jYWxlcyA9IHt9XG5sYW5ndWFnZXMuZm9yRWFjaCgobGFuZykgPT4ge1xuICBsb2NhbGVzW2AvJHtsYW5nfWBdID0ge1xuICAgIGxhYmVsOiBsYW5nLFxuICAgIGxhbmcsXG4gIH1cbn0pXG5cbi8vIGh0dHBzOi8vdml0ZXByZXNzLmRldi9yZWZlcmVuY2Uvc2l0ZS1jb25maWdcbmNvbnN0IHNldHVwQ29uZmlnID0gKGNvbmZpZ0VudikgPT4ge1xuICAgIGNvbnN0IGNvbmZpZzogVXNlckNvbmZpZzxhbnk+ID0ge1xuICAgICAgdGl0bGU6IFwicGVyc29ucy1kb2NcIixcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkEgcGVyc29ucyBkb2NcIixcbiAgICAgIHZpdGU6IGdldFZpdGVDb25maWcoY29uZmlnRW52KSxcbiAgICAgIG1hcmtkb3duOiB7XG4gICAgICAgIC8vIG1hdGg6IHRydWUsIC8vIFx1NjUyRlx1NjMwMXRleFx1OEJFRFx1NkNENVxuICAgICAgICAvLyBsaW5lTnVtYmVyczogdHJ1ZSxcbiAgICAgICAgLy8gbGFuZ3VhZ2VzOiBbXG4gICAgICAgIC8vICAgJ3htbCcsXG4gICAgICAgIC8vICAgJ2phdmEnLFxuICAgICAgICAvLyAgICd0eXBlc2NyaXB0JyxcbiAgICAgICAgLy8gICAnamF2YXNjcmlwdCcsXG4gICAgICAgIC8vICAgJ3J1c3QnLFxuICAgICAgICAvLyBdLFxuICAgICAgICAvLyBjb2RlVHJhbnNmb3JtZXJzOiBbXG4gICAgICAgIC8vICAge1xuICAgICAgICAvLyAgICAgcG9zdHByb2Nlc3MoY29kZSkge1xuICAgICAgICAvLyAgICAgICByZXR1cm4gY29kZS5yZXBsYWNlKC9cXFtcXCFcXCFjb2RlL2csICdbIWNvZGUnKVxuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvLyAgIH1cbiAgICAgICAgLy8gXSxcblxuICAgICAgY29uZmlnOiAobWQpID0+IG1kUGx1Z2luKG1kKSxcbiAgICAvLyBjb25maWcobWQpIHtcbiAgICAvLyAgIG1kUGx1Z2luKG1kKVxuICAgICAgLy8gY29uc3QgZmVuY2UgPSBtZC5yZW5kZXJlci5ydWxlcy5mZW5jZSFcbiAgICAgIC8vIG1kLnJlbmRlcmVyLnJ1bGVzLmZlbmNlID0gZnVuY3Rpb24gKHRva2VucywgaWR4LCBvcHRpb25zLCBlbnYsIHNlbGYpIHtcbiAgICAgIC8vICAgY29uc3QgeyBsb2NhbGVJbmRleCA9ICdyb290JyB9ID0gZW52XG4gICAgICAvLyAgIGNvbnN0IGNvZGVDb3B5QnV0dG9uVGl0bGUgPSAoKCkgPT4ge1xuICAgICAgLy8gICAgIHN3aXRjaCAobG9jYWxlSW5kZXgpIHtcbiAgICAgIC8vICAgICAgIGNhc2UgJ2VzJzpcbiAgICAgIC8vICAgICAgICAgcmV0dXJuICdDb3BpYXIgY1x1MDBGM2RpZ28nXG4gICAgICAvLyAgICAgICBjYXNlICdmYSc6XG4gICAgICAvLyAgICAgICAgIHJldHVybiAnXHUwNkE5XHUwNjdFXHUwNkNDIFx1MDZBOVx1MDYyRidcbiAgICAgIC8vICAgICAgIGNhc2UgJ2tvJzpcbiAgICAgIC8vICAgICAgICAgcmV0dXJuICdcdUNGNTRcdUI0REMgXHVCQ0Y1XHVDMEFDJ1xuICAgICAgLy8gICAgICAgY2FzZSAncHQnOlxuICAgICAgLy8gICAgICAgICByZXR1cm4gJ0NvcGlhciBjXHUwMEYzZGlnbydcbiAgICAgIC8vICAgICAgIGNhc2UgJ3J1JzpcbiAgICAgIC8vICAgICAgICAgcmV0dXJuICdcdTA0MjFcdTA0M0FcdTA0M0VcdTA0M0ZcdTA0MzhcdTA0NDBcdTA0M0VcdTA0MzJcdTA0MzBcdTA0NDJcdTA0NEMgXHUwNDNBXHUwNDNFXHUwNDM0J1xuICAgICAgLy8gICAgICAgY2FzZSAnemgnOlxuICAgICAgLy8gICAgICAgICByZXR1cm4gJ1x1NTkwRFx1NTIzNlx1NEVFM1x1NzgwMSdcbiAgICAgIC8vICAgICAgIGRlZmF1bHQ6XG4gICAgICAvLyAgICAgICAgIHJldHVybiAnQ29weSBjb2RlJ1xuICAgICAgLy8gICAgIH1cbiAgICAgIC8vICAgfSkoKVxuICAgICAgLy8gICByZXR1cm4gZmVuY2UodG9rZW5zLCBpZHgsIG9wdGlvbnMsIGVudiwgc2VsZikucmVwbGFjZShcbiAgICAgIC8vICAgICAnPGJ1dHRvbiB0aXRsZT1cIkNvcHkgQ29kZVwiIGNsYXNzPVwiY29weVwiPjwvYnV0dG9uPicsXG4gICAgICAvLyAgICAgYDxidXR0b24gdGl0bGU9XCIke2NvZGVDb3B5QnV0dG9uVGl0bGV9XCIgY2xhc3M9XCJjb3B5XCI+PC9idXR0b24+YFxuICAgICAgLy8gICApXG4gICAgICAvLyB9XG4gICAgICAvLyBtZC51c2UoZ3JvdXBJY29uTWRQbHVnaW4pXG4gICAgLy8gfVxuICB9LFxuICBoZWFkLFxuICB0aGVtZUNvbmZpZzoge1xuICAgIGxvZ286IHsgc3JjOiAnLi4vdml0ZXByZXNzLWxvZ28tbWluaS5zdmcnLCB3aWR0aDogMjQsIGhlaWdodDogMjQgfSxcblxuICAgIHNvY2lhbExpbmtzOiBbXG4gICAgICB7IGljb246ICdnaXRodWInLCBsaW5rOiAnaHR0cHM6Ly9naXRodWIuY29tL3Z1ZWpzL3ZpdGVwcmVzcycgfVxuICAgIF0sXG4gICAgYWdvbGlhOiB7XG4gICAgICBhcGlLZXk6ICc5OWNhZjMyZTc0M2JhNzdkNzhiMDk1Yjc2M2I4ZTM4MCcsXG4gICAgICBhcHBJZDogJ1pNM1RJOEFLTDQnLFxuICAgIH0sXG4gICAgc2lkZWJhcnMsXG4gICAgbmF2LFxuICAgIGxhbmdzOiBsYW5ndWFnZXMsXG4gIH0sXG4gIGxvY2FsZXMsXG4gIHZ1ZToge1xuICAgIGNvbXBpbGVyOiB2dWVDb21waWxlcixcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgY29tcGlsZXJPcHRpb25zOiB7XG4gICAgICAgIGhvaXN0U3RhdGljOiBmYWxzZSxcbiAgICAgICAgZGlyZWN0aXZlVHJhbnNmb3JtczogYnVpbGRUcmFuc2Zvcm1lcnMoKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgdHJhbnNmb3JtUGFnZURhdGE6IHByb2RcbiAgICA/IChwYWdlRGF0YSwgY3R4KSA9PiB7XG4gICAgICAgIGNvbnN0IHNpdGUgPSByZXNvbHZlU2l0ZURhdGFCeVJvdXRlKFxuICAgICAgICAgIGN0eC5zaXRlQ29uZmlnLnNpdGUsXG4gICAgICAgICAgcGFnZURhdGEucmVsYXRpdmVQYXRoXG4gICAgICAgIClcbiAgICAgICAgY29uc3QgdGl0bGUgPSBgJHtwYWdlRGF0YS50aXRsZSB8fCBzaXRlLnRpdGxlfSB8ICR7cGFnZURhdGEuZGVzY3JpcHRpb24gfHwgc2l0ZS5kZXNjcmlwdGlvbn1gXG4gICAgICAgIDsoKHBhZ2VEYXRhLmZyb250bWF0dGVyLmhlYWQgPz89IFtdKSBhcyBIZWFkQ29uZmlnW10pLnB1c2goXG4gICAgICAgICAgWydtZXRhJywgeyBwcm9wZXJ0eTogJ29nOmxvY2FsZScsIGNvbnRlbnQ6IHNpdGUubGFuZyB9XSxcbiAgICAgICAgICBbJ21ldGEnLCB7IHByb3BlcnR5OiAnb2c6dGl0bGUnLCBjb250ZW50OiB0aXRsZSB9XVxuICAgICAgICApXG4gICAgICB9XG4gICAgOiB1bmRlZmluZWQsXG4gIFxuICAgICAgcG9zdFJlbmRlcihjb250ZXh0KSB7XG4gICAgICAgIC8vIEluamVjdCB0aGUgdGVsZXBvcnQgbWFya3VwXG4gICAgICAgIGlmIChjb250ZXh0LnRlbGVwb3J0cykge1xuICAgICAgICAgIGNvbnN0IGJvZHkgPSBPYmplY3QuZW50cmllcyhjb250ZXh0LnRlbGVwb3J0cykucmVkdWNlKFxuICAgICAgICAgICAgKGFsbCwgW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChrZXkuc3RhcnRzV2l0aCgnI2VsLXBvcHBlci1jb250YWluZXItJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7YWxsfTxkaXYgaWQ9XCIke2tleS5zbGljZSgxKX1cIj4ke3ZhbHVlfTwvZGl2PmBcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gYWxsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29udGV4dC50ZWxlcG9ydHMuYm9keSB8fCAnJ1xuICAgICAgICAgIClcbiAgXG4gICAgICAgICAgY29udGV4dC50ZWxlcG9ydHMgPSB7IC4uLmNvbnRleHQudGVsZXBvcnRzLCBib2R5IH1cbiAgICAgICAgfVxuICBcbiAgICAgICAgcmV0dXJuIGNvbnRleHRcbiAgICAgIH0sXG4gICAgfVxuICBcbiAgICByZXR1cm4gY29uZmlnXG59XG4gIGV4cG9ydCBkZWZhdWx0IHNldHVwQ29uZmlnXG4iXSwKICAibWFw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QSxNQUNWLFNBQVM7QUFBQSxJQUNYO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFO0FBQUEsSUFDQTtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sU0FBUztBQUFBLElBQ1g7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0U7QUFBQSxJQUNBLENBQUM7QUFBQSxJQUNEO0FBQUEsZ0NBQzRCLEtBQUssVUFBVSxTQUFTLENBQUM7QUFBQTtBQUFBLEVBRXZEO0FBQUEsRUFFQSxDQUFDLFVBQVUsQ0FBQyxHQUFHQyxJQUFHLGFBQWFDLE1BQUssUUFBUSxRQUFRLFNBQVMsR0FBRyxPQUFPLENBQUM7QUFBQSxFQUN4RTtBQUFBLElBQ0U7QUFBQSxJQUNBO0FBQUEsTUFDRSxPQUFPO0FBQUEsTUFDUCxLQUFLO0FBQUEsSUFDUDtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRTtBQUFBLElBQ0EsQ0FBQztBQUFBLElBQ0Q7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQVVGO0FBQUEsRUFDQTtBQUFBLElBQ0U7QUFBQSxJQUNBO0FBQUEsTUFDRSxPQUFPO0FBQUEsSUFDVDtBQUFBLElBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUlGO0FBQUEsRUFDQTtBQUFBLElBQ0U7QUFBQSxJQUNBO0FBQUEsTUFDRSxPQUFPO0FBQUEsTUFDUCxLQUFLO0FBQUEsSUFDUDtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRTtBQUFBLElBQ0EsQ0FBQztBQUFBLElBQ0Q7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU9GO0FBQUEsRUFDQTtBQUFBLElBQ0U7QUFBQSxJQUNBO0FBQUEsTUFDRSxPQUFPO0FBQUEsSUFDVDtBQUFBLElBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBUUY7QUFDRjs7O0FDaEt5UyxTQUFTLGtCQUFrQjs7O0FDQXBVO0FBQUEsRUFDRSxTQUFTO0FBQUEsSUFDUDtBQUFBLE1BQ0UsTUFBUTtBQUFBLE1BQ1IsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLElBQ2pCO0FBQUEsSUFDQTtBQUFBLE1BQ0UsTUFBUTtBQUFBLE1BQ1IsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLElBQ2pCO0FBQUEsSUFDQTtBQUFBLE1BQ0UsTUFBUTtBQUFBLE1BQ1IsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLElBQ2pCO0FBQUEsSUFDQTtBQUFBLE1BQ0UsTUFBUTtBQUFBLE1BQ1IsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLElBQ2pCO0FBQUEsSUFDQTtBQUFBLE1BQ0UsTUFBUTtBQUFBLE1BQ1IsTUFBUTtBQUFBLE1BQ1IsYUFBZTtBQUFBLElBQ2pCO0FBQUEsRUFDRjtBQUNGOzs7QUR0QkEsU0FBUyxTQUFTO0FBQ2hCLFNBQU8sT0FBTztBQUFBLElBQ1osT0FBTyxRQUFRLGVBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQyxNQUFNQyxRQUFPLE1BQU07QUFDakQsWUFBTSxPQUlBLE9BQU8sT0FBT0EsUUFBTyxFQUFFLElBQUksQ0FBQ0MsV0FBVTtBQUFBLFFBQzFDLEdBQUdBO0FBQUEsUUFDSCxNQUFNLEdBQUcsV0FBV0EsTUFBSyxJQUFJLElBQUksS0FBSyxXQUFXLElBQUksQ0FBQyxHQUFHQSxNQUFLLElBQUk7QUFBQSxNQUNwRSxFQUFFO0FBRUYsYUFBTyxDQUFDLE1BQU0sSUFBSTtBQUFBLElBQ3BCLENBQUM7QUFBQSxFQUNIO0FBQ0Y7QUFFTyxJQUFNLE1BQU0sT0FBTzs7O0FFdkIxQjtBQUFBLEVBQ0UsU0FBUztBQUFBLElBQ1AsS0FBTztBQUFBLE1BQ0wsTUFBUTtBQUFBLE1BQ1IsTUFBUTtBQUFBLE1BQ1IsVUFBWTtBQUFBLFFBQ1Y7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxRQUNWO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLGlCQUFpQjtBQUFBLE1BQ2YsTUFBUTtBQUFBLE1BQ1IsTUFBUTtBQUFBLE1BQ1IsVUFBWTtBQUFBLFFBQ1Y7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsT0FBUztBQUFBLE1BQ1AsTUFBUTtBQUFBLE1BQ1IsVUFBWTtBQUFBLFFBQ1Y7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFVBQ1IsV0FBYTtBQUFBLFFBQ2Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsZUFBaUI7QUFBQSxNQUNmLE1BQVE7QUFBQSxNQUNSLFVBQVk7QUFBQSxRQUNWO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxNQUFRO0FBQUEsTUFDTixNQUFRO0FBQUEsTUFDUixVQUFZO0FBQUEsUUFDVjtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFVBQ1IsV0FBYTtBQUFBLFFBQ2Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsVUFDUixXQUFhO0FBQUEsUUFDZjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxVQUNSLFdBQWE7QUFBQSxRQUNmO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsTUFBUTtBQUFBLE1BQ04sTUFBUTtBQUFBLE1BQ1IsVUFBWTtBQUFBLFFBQ1Y7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxVQUNSLFdBQWE7QUFBQSxRQUNmO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxVQUNSLFdBQWE7QUFBQSxRQUNmO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxVQUNSLFdBQWE7QUFBQSxRQUNmO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFVBQ1IsV0FBYTtBQUFBLFFBQ2Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsWUFBYztBQUFBLE1BQ1osTUFBUTtBQUFBLE1BQ1IsVUFBWTtBQUFBLFFBQ1Y7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFVBQ1IsV0FBYTtBQUFBLFFBQ2Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxVQUFZO0FBQUEsTUFDVixNQUFRO0FBQUEsTUFDUixVQUFZO0FBQUEsUUFDVjtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBVTtBQUFBLE1BQ1IsTUFBUTtBQUFBLE1BQ1IsVUFBWTtBQUFBLFFBQ1Y7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFVBQ1IsV0FBYTtBQUFBLFFBQ2Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjs7O0FDaFlBO0FBQUEsRUFDRSxTQUFTO0FBQUEsSUFDUCxLQUFPO0FBQUEsTUFDTCxNQUFRO0FBQUEsTUFDUixNQUFRO0FBQUEsTUFDUixVQUFZO0FBQUEsUUFDVjtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGOzs7QUNqQkE7QUFBQSxFQUNFLFNBQVM7QUFBQSxJQUNQLFFBQVU7QUFBQSxNQUNSLE1BQVE7QUFBQSxNQUNSLE1BQVE7QUFBQSxNQUNSLFVBQVk7QUFBQSxRQUNWO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGOzs7QUNiQTtBQUFBLEVBQ0UsU0FBUztBQUFBLElBQ1AsU0FBVztBQUFBLE1BQ1QsTUFBUTtBQUFBLE1BQ1IsTUFBUTtBQUFBLE1BQ1IsVUFBWTtBQUFBLFFBQ1Y7QUFBQSxVQUNFLE1BQVE7QUFBQSxVQUNSLE1BQVE7QUFBQSxRQUNWO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7OztBQ2JBO0FBQUEsRUFDRSxTQUFTO0FBQUEsSUFDUCxVQUFZO0FBQUEsTUFDVixNQUFRO0FBQUEsTUFDUixNQUFRO0FBQUEsTUFDUixVQUFZO0FBQUEsUUFDVjtBQUFBLFVBQ0UsTUFBUTtBQUFBLFVBQ1IsTUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFRO0FBQUEsVUFDUixNQUFRO0FBQUEsUUFDVjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGOzs7QUNqQkE7QUFBQSxFQUNF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VSxNQUFNLHFDQUFxQztBQUFBLE1BQy9EO0FBQUEsTUFDQSxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsUUFDUixPQUFPO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQSxPQUFPO0FBQUEsSUFDVDtBQUFBLElBQ0E7QUFBQSxJQUNBLEtBQUs7QUFBQSxNQUNILFVBQVU7QUFBQSxNQUNWLFVBQVU7QUFBQSxRQUNSLGlCQUFpQjtBQUFBLFVBQ2YsYUFBYTtBQUFBLFVBQ2IscUJBQXFCLGtCQUFrQjtBQUFBLFFBQ3pDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLG1CQUFtQixPQUNmLENBQUMsVUFBVSxRQUFRO0FBQ2pCLFlBQU0sT0FBTztBQUFBLFFBQ1gsSUFBSSxXQUFXO0FBQUEsUUFDZixTQUFTO0FBQUEsTUFDWDtBQUNBLFlBQU0sUUFBUSxHQUFHLFNBQVMsU0FBUyxLQUFLLEtBQUssTUFBTSxTQUFTLGVBQWUsS0FBSyxXQUFXO0FBQzFGLE9BQUUsU0FBUyxZQUFZLFNBQVMsQ0FBQyxHQUFvQjtBQUFBLFFBQ3BELENBQUMsUUFBUSxFQUFFLFVBQVUsYUFBYSxTQUFTLEtBQUssS0FBSyxDQUFDO0FBQUEsUUFDdEQsQ0FBQyxRQUFRLEVBQUUsVUFBVSxZQUFZLFNBQVMsTUFBTSxDQUFDO0FBQUEsTUFDbkQ7QUFBQSxJQUNGLElBQ0E7QUFBQSxJQUVBLFdBQVcsU0FBUztBQUVsQixVQUFJLFFBQVEsV0FBVztBQUNyQixjQUFNLE9BQU8sT0FBTyxRQUFRLFFBQVEsU0FBUyxFQUFFO0FBQUEsVUFDN0MsQ0FBQyxLQUFLLENBQUMsS0FBSyxLQUFLLE1BQU07QUFDckIsZ0JBQUksSUFBSSxXQUFXLHVCQUF1QixHQUFHO0FBQzNDLHFCQUFPLEdBQUcsR0FBRyxZQUFZLElBQUksTUFBTSxDQUFDLENBQUMsS0FBSyxLQUFLO0FBQUEsWUFDakQ7QUFDQSxtQkFBTztBQUFBLFVBQ1Q7QUFBQSxVQUNBLFFBQVEsVUFBVSxRQUFRO0FBQUEsUUFDNUI7QUFFQSxnQkFBUSxZQUFZLEVBQUUsR0FBRyxRQUFRLFdBQVcsS0FBSztBQUFBLE1BQ25EO0FBRUEsYUFBTztBQUFBLElBQ1Q7QUFBQSxFQUNGO0FBRUEsU0FBTztBQUNYO0FBQ0UsSUFBTyxpQkFBUTsiLAogICJuYW1lcyI6IFsiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUiLCAicGF0aCIsICJmcyIsICJmcyIsICJwYXRoIiwgImZzIiwgInBhdGgiLCAiZnMiLCAicGF0aCIsICJsb2NhbGVzIiwgIml0ZW0iLCAicGF0aCIsICJmcyIsICJwYXRoIiwgInBhdGgiLCAiZnMiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUiLCAicGF0aCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSJdCn0K
