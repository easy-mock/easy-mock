'use strict'

const hljs = require('highlight.js')
const slugify = require('transliteration').slugify
const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')
const markdownItAttrs = require('markdown-it-attrs')

function createMarkdown () {
  const replaceDelimiters = function (str) {
    return str.replace(/({{|}})/g, '<span>$1</span>')
  }

  const markdown = markdownIt({
    breaks: true,
    highlight (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          const value = replaceDelimiters(hljs.highlight(lang, str, true).value)
          return `<pre data-lang="${lang}"><code class="language-${lang}">${value}</code></pre>`
        } catch (err) { }
      }
      return ''
    }
  })

  markdown.core.ruler.push('title_class_rule', (state) => {
    state.tokens
      .filter(o => 'h1 h2 h3 h4 h5 h6'.split(' ').indexOf(o.tag) > -1)
      .forEach((token) => {
        const level = token.tag.split('')[1]
        const className = level === 1 ? 'markdown-heading' : 'markdown-heading markdown-toc-heading'
        token.attrs = [['class', className]]
      })
  })

  markdown
    .use(markdownItAttrs)
    .use(markdownItAnchor, {
      level: 3,
      slugify,
      permalinkSymbol: '#',
      permalink: true,
      permalinkBefore: true
    })

  return markdown
}

exports.markdown = createMarkdown()
