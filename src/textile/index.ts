import { KeyInfo, Client, ThreadID } from '@textile/hub'
import { useState, useEffect } from 'react'

const ARK_COLLECTION = 'ARKCOLLECTION'
const ARK_BOOKMARK = 'ARKBOOKMARK'

export const useClient = (): { client: Client | null } => {
  const [client, setClient] = useState(null)
  useEffect(() => {
    const _getClient = async () => {
      return await getClient()
        .then((_client) => setClient(_client as any))
        .catch((err) => setClient(null))
    }
    _getClient()
  }, [])
  return { client }
}

export const getClient = async (): Promise<Client> => {
  const keyInfo: KeyInfo = {
    key: 'bsy5djos5mrpp5xcfzh2qjgcprm',
    secret: 'brydotwaz2b5635qfussiopkblnbtktukmn6ew6q',
  }
  const client = await Client.withKeyInfo(keyInfo)
  return client
}

export const getCollectionList = async (
  client: Client,
  threadID: ThreadID
): Promise<any> => {
  let collectionInfo
  try {
    collectionInfo = await client.getCollectionInfo(threadID, ARK_COLLECTION)
  } catch (error) {
    return []
  }
  return await client.find(threadID, ARK_COLLECTION, {})
}

export const getThreadID = (str: string): ThreadID => {
  return ThreadID.fromString(str)
}
