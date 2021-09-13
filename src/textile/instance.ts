import { PrivateKey, Identity, Client, ThreadID, UserAuth } from '@textile/hub'
import axios from 'axios'
import { ArkBookmark, ArkFolder } from './types'

const ARK_COLLECTION = 'ARKCOLLECTION'
const ARK_BOOKMARK = 'ARKBOOKMARK'

class Singleton {
  private static instance: Singleton
  private client: Client
  private credentials: UserAuth
  private identity: Identity
  private threadNameIdDic: any = {}

  private constructor() {
    const localCredentials = localStorage.getItem('credentials')
    if (localCredentials) {
      try {
        const credentials = JSON.parse(localCredentials)
        if (new Date(credentials.msg).getTime() > Date.now()) {
          this.credentials = credentials
        }
      } catch (error) {}
    }

    const localThreadNameIdDic = localStorage.getItem('threadNameIdDic')
    if (localThreadNameIdDic) {
      try {
        this.threadNameIdDic = JSON.parse(localThreadNameIdDic)
      } catch (error) {}
    }
    const identity = this.getIdentity()
    if (identity) {
      this.identity = identity
      this.initClient(identity)
    }
  }

  public static getInstance(): Singleton {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton()
    }

    return Singleton.instance
  }

  public async login(id: string) {
    console.log('### login', id)
    try {
      const identity = PrivateKey.fromString(id)
      this.identity = identity
      localStorage.setItem('identity', id)
      this.initClient(identity)
    } catch (error) {
      console.log(error)
    }
  }

  public getClient() {
    return this.client
  }

  public getIdentity(): Identity | null {
    if (this.identity) return this.identity

    const id = localStorage.getItem('identity')
    if (!id) return null

    return PrivateKey.fromString(id)
  }

  public getPubkey(): string {
    const identity = this.identity
    if (!identity) return ''
    return identity.public.toString()
  }

  public async initClient(id: Identity) {
    console.log('### initClient', id)
    if (this.client) return this.client

    const credentials = await this.getCredentials()
    this.client = Client.withUserAuth(credentials)

    await this.client.getToken(id)

    return this.client
  }

  public async getCredentials(): Promise<UserAuth> {
    if (this.credentials) return this.credentials

    const result = await axios.post(
      'https://ark.chezhe.dev/api/auth/credentials'
    )
    this.credentials = result.data
    localStorage.setItem('credentials', JSON.stringify(this.credentials))
    return result.data
  }

  public async getThreadId(name: string): Promise<ThreadID> {
    if (!this.threadNameIdDic[name]) {
      const thread = await this.client.getThread(name)
      this.threadNameIdDic[name] = thread.id
      localStorage.setItem(
        'threadNameIdDic',
        JSON.stringify(this.threadNameIdDic)
      )
    }
    return ThreadID.fromString(this.threadNameIdDic[name])
  }

  public async createFolder(folder: ArkFolder): Promise<ArkFolder> {
    const pubkey = this.identity.public.toString()
    const threadId = await this.getThreadId(pubkey)
    const ids = await this.client.create(threadId, ARK_COLLECTION, [folder])
    return { ...folder, _id: ids[0] }
  }

  public async queryMyFolders() {
    const pubkey = this.identity.public.toString()
    return await this.queryFolders(pubkey)
  }

  public async queryFolders(pubkey: string, folderId?: string) {
    const threadId = await this.getThreadId(pubkey)
    if (folderId) {
      return await this.client.findByID(threadId, ARK_COLLECTION, folderId)
    }
    const condition = { sort: { fieldPath: '_id', desc: true } }
    return await this.client.find(threadId, ARK_COLLECTION, condition)
  }

  public async createBookmarks(bookmarks: ArkBookmark[]): Promise<string[]> {
    const pubkey = this.identity.public.toString()
    const threadId = await this.getThreadId(pubkey)
    return await this.client.create(threadId, ARK_BOOKMARK, bookmarks)
  }
}

export default Singleton
