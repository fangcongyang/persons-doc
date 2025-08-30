import mdContainer from 'markdown-it-container'
import createDemoContainer from '../plugins/demo'
import headers from '../plugins/headers'
import type { MarkdownRenderer } from 'vitepress'

export const mdPlugin = (md: MarkdownRenderer) => {
  md.use(headers)
  md.use(mdContainer, 'demo', createDemoContainer(md))
}