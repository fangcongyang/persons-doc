import { isExternal } from 'vitepress/dist/client/shared'
import { ensureLang, base } from '../utils/lang'
import navLocale from '../i18n/pages/sidebar.json'

// Mapping the first sub link to the nav link to avoid 404 error.

function getNav() {
  if (!navLocale) return {}
  return Object.fromEntries(
    Object.entries(navLocale).map(([lang, locales]) => {
      if (!Array.isArray(locales)) return [lang, []]
      const item: any[] = locales.map((item) => ({
        ...item,
        link: isExternal(item.link)
          ? item.link
          : `${base}${lang}${item.link}`.replace(/\/+/g, '/'),
      }))

      return [lang, item]
    })
  )
}

export const nav = getNav()
