import { ensureLang } from "../utils/lang";
import javaLocale from "../i18n/pages/java.json";
import rustLocale from "../i18n/pages/rust.json";
import systemLocale from "../i18n/pages/system.json";
import vueLocale from "../i18n/pages/vue.json";
import databaseLocale from "../i18n/pages/database.json";
import middlewareLocale from "../i18n/pages/middleware.json";
import gitLocale from "../i18n/pages/git.json";
import nodeLocale from "../i18n/pages/node.json";

function getJavaSidebar() {
  return Object.fromEntries(
    Object.entries(javaLocale).map(([lang, val]) => [
      lang,
      Object.values(val).map((item) => mapPrefix(item, lang, "base" in item ? item.base : "")),
    ])
  );
}

function getRustSidebar() {
  return Object.fromEntries(
    Object.entries(rustLocale).map(([lang, val]) => [
      lang,
      Object.values(val).map((item) => mapPrefix(item, lang, "base" in item ? item.base : "")),
    ])
  );
}

function getGitSidebar() {
  return Object.fromEntries(
    Object.entries(gitLocale).map(([lang, val]) => [
      lang,
      Object.values(val).map((item) => mapPrefix(item, lang, item.base)),
    ])
  );
}

function getSystemSidebar() {
  return Object.fromEntries(
    Object.entries(systemLocale).map(([lang, val]) => [
      lang,
      Object.values(val).map((item) => mapPrefix(item, lang, item.base)),
    ])
  );
}

function getDatabaseSideBar() {
  return Object.fromEntries(
    Object.entries(databaseLocale).map(([lang, val]) => [
      lang,
      Object.values(val).map((item) => mapPrefix(item, lang, item.base)),
    ])
  );
}

function getVueSideBar() {
  return Object.fromEntries(
    Object.entries(vueLocale).map(([lang, val]) => [
      lang,
      Object.values(val).map((item) => mapPrefix(item, lang, item.base)),
    ])
  );
}

function getMiddlewareSideBar() {
  return Object.fromEntries(
    Object.entries(middlewareLocale).map(([lang, val]) => [
      lang,
      Object.values(val).map((item) => mapPrefix(item, lang, item.base)),
    ])
  );
}

function getNodeSidebar() {
  return Object.fromEntries(
    Object.entries(nodeLocale).map(([lang, val]) => [
      lang,
      Object.values(val).map((item) => mapPrefix(item, lang, item.base)),
    ])
  );
}

// return sidebar with language configs.
// this might create duplicated data but the overhead is ignorable
const getSidebars = () => {
  return {
    "/java/": getJavaSidebar(),
    "/rust/": getRustSidebar(),
    "/git/": getGitSidebar(),
    "/system/": getSystemSidebar(),
    "/vue/": getVueSideBar(),
    "/node/": getNodeSidebar(),
    "/database/": getDatabaseSideBar(),
    "/middleware/": getMiddlewareSideBar(),
  };
};

type Item = {
  text: string;
  children?: Item[];
  link?: string;
};

function mapPrefix(item: Item, lang: string, prefix = "") {
  if (item.children && item.children.length > 0) {
    return {
      ...item,
      children: item.children.map((child) => mapPrefix(child, lang, prefix)),
    };
  }
  return {
    ...item,
    link: `${ensureLang(lang)}${prefix}${item.link}`,
  };
}

export const sidebars = getSidebars();
