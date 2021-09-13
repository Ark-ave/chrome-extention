export enum BookmarkType {
  DOUBAN_STATUS = 'douban.status',
  DOUBAN_TOPIC = 'douban.topic',
  DOUBAN_NOTE = 'douban.note',
  DOUBAN_REVIEW = 'douban.review',
  DOUBAN_RATE = 'douban.rate',
  WEIBO = 'weibo',
  WECHAT_ARTICLE = 'wechat.article',
  TWITTER = 'twitter',
  OTHER = 'other',
}

export type ArkBookmark = {
  origin: string
  comment: string
  type: BookmarkType
  createdAt: number
  collectionId?: string
  title: string
  refer: any
  pubtime: string
  user: string
  content?: string
  _id?: string
}

export type ArkFolder = {
  title: string
  description: string
  createdAt: number
  tags: string[]
  _id?: string
}
