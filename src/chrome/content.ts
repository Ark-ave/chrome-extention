import { ChromeMessage, Sender } from '../types'

enum BOOKMARK_TYPE {
  DOUBAN_STATUS = 'douban.status',
  DOUBAN_TOPIC = 'douban.topic',
  DOUBAN_NOTE = 'douban.note',
  DOUBAN_REVIEW = 'douban.review',
  WEIBO = 'weibo',
  WECHAT_ARTICLE = 'wechat.article',
  TWITTER = 'twitter',
}

const turndownService = new window.TurndownService()
turndownService.addRule('aViewLarge', {
  filter: function (node: any, options: any) {
    return node.nodeName === 'A' && /view-large/.test(node.className)
  },
  replacement: function () {
    return ''
  },
})
turndownService.addRule('imageDataSrc', {
  filter: function (node, options) {
    return node.nodeName === 'IMG' && node.dataset && node.dataset.src
  },
  replacement: function (content, node, options) {
    return '![' + node.alt + '](' + node.dataset.src + ')'
  },
})
turndownService.remove(['script', 'style', 'aViewLarge', 'imageDataSrc'])

declare global {
  interface Window {
    // add you custom properties and methods
    TurndownService: any
    $: any
  }
  interface Element {
    dataset: any
  }
}

type MessageResponse = (response?: any) => void

const validateSender = (
  message: ChromeMessage,
  sender: chrome.runtime.MessageSender
) => {
  return sender.id === chrome.runtime.id && message.from === Sender.React
}

const messagesFromReactAppListener = (
  message: ChromeMessage,
  sender: chrome.runtime.MessageSender,
  response: MessageResponse
) => {
  const isValidated = validateSender(message, sender)
  if (isValidated && message.message === 'getBookmark') {
    getBookmark(response)
  }
}

const main = () => {
  chrome.runtime.onMessage.addListener(messagesFromReactAppListener)
}

main()

function getBookmark(response) {
  const uri = window.location.href
  if (/douban.com\/people\/\S*\/status\/\d/.test(uri)) {
    const statusItem = document.getElementsByClassName('new-status')[0]
    const bookmark = formatDoubanStatus(statusItem)
    response(JSON.stringify(bookmark))
  } else if (
    /douban.com\/(note|review|(movie|book|music)\/review)\/\d/.test(uri)
  ) {
    const article = document.getElementsByClassName('article')[0]
    const bookmark = formatDoubanNote(article)
    response(JSON.stringify(bookmark))
  } else if (/douban.com\/group\/topic\/\d/.test(uri)) {
    const article = document.getElementsByClassName('article')[0]
    const bookmark = formatDoubanTopic(article)
    response(JSON.stringify(bookmark))
  } else if (/douban.com\/photos\/photo\/\d/.test(uri)) {
    const content = document.getElementById('content')
    const bookmark = formatDoubanPhoto(content)
    response(JSON.stringify(bookmark))
  } else if (/mp.weixin.qq.com\/s/.test(uri)) {
    const bookmark = formatWechatArticle()
    response(JSON.stringify(bookmark))
  }
}

function formatWechatArticle() {
  const jsContent = document.getElementById('js_content')
  const content = turndownService.turndown(jsContent || '')
  const name = document.getElementById('js_name')
  const user = turndownService.turndown(name || '')
  const pubtime = document.getElementById('publish_time').innerText
  const title = document.getElementById('activity-name').innerText

  return {
    user,
    pubtime,
    title,
    content,
    origin: window.location.href,
    type: 'wechat.article',
  }
}

function formatDoubanPhoto(ele: Element) {
  const imageShow = ele.getElementsByClassName('image-show')[0]
  const photoShow = ele.getElementsByClassName('photo-show')[0]
  let title = ''
  if (imageShow) {
    title = turndownService.turndown(imageShow)
  } else if (photoShow) {
    title = turndownService.turndown(photoShow)
  }

  const posterInfo = ele.getElementsByClassName('poster-info')[0]
  if (posterInfo) {
    title = turndownService.turndown(posterInfo) + title
  }

  return {
    user: '',
    pubtime: '',
    title,
    refer: '',
    origin,
    type: BOOKMARK_TYPE.DOUBAN_STATUS,
  }
}

function formatDoubanStatus(ele: Element) {
  if (!ele) {
    return ''
  }
  const statusItem = ele.getElementsByClassName('status-item')[0]
  if (!statusItem || statusItem.classList.contains('deleted')) {
    return ''
  }

  const hd = statusItem.getElementsByClassName('hd')
  const bd = statusItem.getElementsByClassName('bd')
  if (hd.length) {
    let _user = '',
      _pubtime = '',
      _quote = '',
      _refer: any = ''
    // rate for movie, music or book
    const blockquote = hd[0].getElementsByTagName('blockquote')
    const user = hd[0].getElementsByClassName('lnk-people')
    const pubtime = hd[0].getElementsByClassName('pubtime')
    _user = turndownService.turndown(user[0].outerHTML)

    if (pubtime.length) {
      _pubtime = turndownService.turndown(pubtime[0])
    } else {
      const createdAts = statusItem.getElementsByClassName('created_at')
      _pubtime = createdAts.length
        ? createdAts[0].getAttribute('title') ?? ''
        : ''
    }
    if (blockquote.length) {
      _quote = turndownService.turndown(blockquote[0] || '')
    } else {
      if (bd.length) {
        const saying = bd[0].getElementsByClassName('status-saying')
        _quote = turndownService.turndown(saying[0] || '')
      } else {
        _quote = ''
      }
    }

    if (bd.length) {
      const bdCl = bd[0].classList
      if (
        bdCl.contains('book') ||
        bdCl.contains('movie') ||
        bdCl.contains('music') ||
        bdCl.contains('rec')
      ) {
        const title = bd[0].getElementsByClassName('title')
        _refer = turndownService.turndown(title[0] || '')
      }
    }

    const reshare = ele.getElementsByClassName('status-real-wrapper')[0]
    if (reshare) {
      _refer = formatDoubanStatus(reshare)
    }

    const origin = window.location.href

    return {
      user: _user,
      pubtime: _pubtime,
      title: _quote,
      refer: _refer,
      origin,
      type: BOOKMARK_TYPE.DOUBAN_STATUS,
    }
  }
  return {}
}

function formatDoubanNote(article: Element) {
  if (!article) {
    return ''
  }
  const origin = window.location.href
  const noteHeader = article.getElementsByClassName('note-header')[0]
  const mainHd = article.getElementsByClassName('main-hd')[0]

  let title = '',
    user = '',
    pubtime = ''
  if (noteHeader) {
    title = turndownService.turndown(noteHeader.getElementsByTagName('h1')[0])
    user = turndownService.turndown(
      noteHeader.getElementsByClassName('note-author')[0].outerHTML
    )

    const pubdate = noteHeader.getElementsByClassName('pub-date')[0]
    if (pubdate) {
      pubtime = pubdate.innerHTML
    }
  } else if (mainHd) {
    user = turndownService.turndown(mainHd.firstElementChild)
    const mainMeta = mainHd.getElementsByClassName('main-meta')[0]
    pubtime = mainMeta?.innerHTML
    title = turndownService.turndown(article.firstElementChild.innerHTML || '')
  }
  const reportEle = document.getElementById('link-report_note')
  reportEle?.remove()

  const noteEle = document.getElementById('link-report')
  const note = turndownService.turndown(noteEle)

  return {
    user,
    title,
    content: note,
    origin,
    pubtime,
    type: origin.includes('review')
      ? BOOKMARK_TYPE.DOUBAN_REVIEW
      : BOOKMARK_TYPE.DOUBAN_NOTE,
  }
}

function formatDoubanTopic(topic: Element) {
  const title = document.title
  let pubtime = ''
  const topicDoc = topic.getElementsByClassName('topic-doc')[0]
  const from = topicDoc.getElementsByClassName('from')[0]
  const createTime = topic.getElementsByClassName('create-time')[0]
  if (createTime) {
    pubtime = createTime.innerHTML
  }

  const user = turndownService.turndown(
    from.getElementsByTagName('a')[0].outerHTML
  )
  const note = turndownService.turndown(document.getElementById('link-report'))
  return {
    user,
    title,
    content: note,
    pubtime,
    origin: window.location.href,
    type: BOOKMARK_TYPE.DOUBAN_TOPIC,
  }
}

// function formatWechat() {
//   const jsContent = document.getElementById('js_content')
//   const content = turndownService.turndown(jsContent || '')
//   const name = document.getElementById('js_name')
//   const user = turndownService.turndown(name || '')
//   return {
//     user,
//     title: document.title,
//     content,
//     origin: href,
//   }
// }
