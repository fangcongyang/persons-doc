import { ensureLang } from '../utils/lang'
import javaLocale from '../i18n/pages/java.json'
import vueLocale from '../i18n/pages/vue.json'
import databaseLocale from '../i18n/pages/database.json'

function getJavaSidebar() {
  return Object.fromEntries(
    Object.entries(javaLocale).map(([lang, val]) => [
      lang,
      Object.values(val).map((item) => mapPrefix(item, lang, item.base)),
    ])
  )
}

function getDatabaseSideBar() {
  return Object.fromEntries(
    Object.entries(databaseLocale).map(([lang, val]) => [
      lang,
      Object.values(val).map((item) => mapPrefix(item, lang, item.base)),
    ])
  )
}

function getVueSideBar() {  
  return Object.fromEntries(
    Object.entries(vueLocale).map(([lang, val]) => [
      lang,
      Object.values(val).map((item) => mapPrefix(item, lang, item.base)),
    ])
  )
}

// return sidebar with language configs.
// this might create duplicated data but the overhead is ignorable
const getSidebars = () => {
  return {
    '/java/': getJavaSidebar(),
    '/vue/': getVueSideBar(),
    '/database/': getDatabaseSideBar(),
  }
}

type Item = {
  text: string
  children?: Item[]
  link?: string
}

function mapPrefix(item: Item, lang: string, prefix = '') {
  if (item.children && item.children.length > 0) {
    return {
      ...item,
      children: item.children.map((child) => mapPrefix(child, lang, prefix)),
    }
  }
  return {
    ...item,
    link: `${ensureLang(lang)}${prefix}${item.link}`,
  }
}

export const sidebars = getSidebars()
