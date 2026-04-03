import { ensureLang, base as siteBase } from "../utils/lang";
import javaLocale from "../i18n/pages/java.json";
import rustLocale from "../i18n/pages/rust.json";
import systemLocale from "../i18n/pages/system.json";
import vueLocale from "../i18n/pages/vue.json";
import databaseLocale from "../i18n/pages/database.json";
import middlewareLocale from "../i18n/pages/middleware.json";
import gitLocale from "../i18n/pages/git.json";
import nodeLocale from "../i18n/pages/node.json";
import webLocale from "../i18n/pages/web.json";

// return sidebar for a specific category
function getSidebar(localeData: any, category: string, base?: string) {
  return Object.fromEntries(
    Object.entries(localeData).map(([lang, val]) => [
      lang,
      Object.values(val as any).map((item: any) => mapPrefix(item, lang, base || item.base || "")),
    ])
  );
}

// return sidebar with language configs.
export const getSidebars = () => {
  return {
    "/java/": getSidebar(javaLocale, "java"),
    "/rust/": getSidebar(rustLocale, "rust"),
    "/git/": getSidebar(gitLocale, "git"),
    "/system/": getSidebar(systemLocale, "system"),
    "/vue/": getSidebar(vueLocale, "vue"),
    "/node/": getSidebar(nodeLocale, "node"),
    "/database/": getSidebar(databaseLocale, "database"),
    "/middleware/": getSidebar(middlewareLocale, "middleware"),
    "/web/": getSidebar(webLocale, "web"),
  };
};

type Item = {
  text: string;
  children?: Item[];
  link?: string;
};

function mapPrefix(item: any, lang: string, prefix = "") {
  if (item.children && item.children.length > 0) {
    return {
      ...item,
      children: item.children.map((child: any) => mapPrefix(child, lang, prefix)),
    };
  }
  return {
    ...item,
    link: `${siteBase}${lang}${prefix}${item.link}`.replace(/\/+/g, '/'),
  };
}

export const sidebars = getSidebars();
