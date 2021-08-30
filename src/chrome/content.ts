import { ChromeMessage, Sender } from '../types'

const BUTTON_LABEL = '收藏到[方舟]'

declare global {
  interface Window {
    // add you custom properties and methods
    TurndownService: any
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

  if (isValidated && message.message === 'Hello from React') {
    console.log('### hahah')
    response('Hello from content.js')
  }

  if (isValidated && message.message === 'delete logo') {
    const logo = document.getElementById('hplogo')
    logo?.parentElement?.removeChild(logo)
  }
}

const main = () => {
  console.log('[content.ts] Main')
  /**
   * Fired when a message is sent from either an extension process or a content script.
   */
  chrome.runtime.onMessage.addListener(messagesFromReactAppListener)
}

// main()
const turndownService = new window.TurndownService()
turndownService.remove(['script', 'style'])
const href = window.location.href

function formatDoubanStatusItem(statusItem: Element) {
  const hd = statusItem.getElementsByClassName('hd')

  const bd = statusItem.getElementsByClassName('bd')
  if (hd.length) {
    let _user = '',
      _pubtime = '',
      _quote = '',
      _refer = ''
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

    const uid = statusItem.dataset.uid
    const sid = statusItem.dataset.sid
    const origin = `https://www.douban.com/people/${uid}/status/${sid}/`

    return {
      user: _user,
      pubtime: _pubtime,
      quote: _quote,
      refer: _refer,
      origin,
    }
  }
}

function addButton2DoubanStatus() {
  const statuses = document.getElementsByClassName('new-status')
  for (let index = 0; index < statuses.length; index++) {
    const status = statuses[index]
    const actions = status.getElementsByClassName('actions')

    const button = document.createElement('button')
    button.innerText = BUTTON_LABEL
    button.className = 'action-ark'
    // eslint-disable-next-line no-loop-func
    button.addEventListener('click', (e) => {
      e.preventDefault()
      const statusItems = status.getElementsByClassName('status-item')
      for (let itemIndex = 0; itemIndex < statusItems.length; itemIndex++) {
        console.log(formatDoubanStatusItem(statusItems[itemIndex]))
      }
    })
    actions[0].appendChild(button)
  }
}

function formatDoubanNote(article: Element) {
  const noteHeader = article.getElementsByClassName('note-header')

  const title = turndownService.turndown(
    noteHeader[0].getElementsByTagName('h1')[0]
  )
  const user = turndownService.turndown(
    noteHeader[0].getElementsByClassName('note-author')[0].outerHTML
  )

  const reportEle = document.getElementById('link-report_note')
  reportEle?.remove()

  const noteEle = document.getElementById('link-report')
  const note = turndownService.turndown(noteEle)

  return {
    user,
    title,
    note,
    origin: href,
  }
}

function addButton2DoubanNote() {
  if (!/www.douban.com\/note\/\d/.test(href)) {
    return
  }

  const articles = document.getElementsByClassName('article')
  for (let index = 0; index < articles.length; index++) {
    const article = articles[index]
    const footerSharing = article.getElementsByClassName('footer-sharing')

    const button = document.createElement('button')
    button.innerText = BUTTON_LABEL
    button.className = 'action-ark'
    // eslint-disable-next-line no-loop-func
    button.addEventListener('click', (e) => {
      e.preventDefault()
      const articleJSON = formatDoubanNote(article)
      console.log(articleJSON)
    })
    footerSharing[0].appendChild(button)
  }
}

function formatDoubanTopic(topic: Element) {
  const title = document.title

  const topicDoc = topic.getElementsByClassName('topic-doc')[0]
  const from = topicDoc.getElementsByClassName('from')[0]

  const user = turndownService.turndown(
    from.getElementsByTagName('a')[0].outerHTML
  )
  const note = turndownService.turndown(document.getElementById('link-report'))
  return {
    user,
    title,
    note,
    origin: href,
  }
}

function addButton2DoubanTopic() {
  if (!/douban.com\/group\/topic\/\d/.test(href)) {
    return
  }

  const topics = document.getElementsByClassName('article')
  for (let index = 0; index < topics.length; index++) {
    const topic = topics[index]
    const snsBar = topic.getElementsByClassName('sns-bar')
    const button = document.createElement('button')
    button.innerText = BUTTON_LABEL
    button.className = 'action-ark'
    // eslint-disable-next-line no-loop-func
    button.addEventListener('click', (e) => {
      e.preventDefault()
      const topicJSON = formatDoubanTopic(topic)
      console.log(topicJSON)
    })
    console.log(snsBar)
    console.log(topic)
    snsBar[0].appendChild(button)
  }
}

function initButtons() {
  addButton2DoubanStatus()

  addButton2DoubanNote()

  addButton2DoubanTopic()
}

initButtons()
