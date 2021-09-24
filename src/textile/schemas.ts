export const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Person',
  type: 'object',
  properties: {
    _id: { type: 'string' },
    name: { type: 'string' },
    missions: {
      type: 'number',
      minimum: 0,
    },
  },
}

export const ArkFolderSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'ArkFolder',
  type: 'object',
  properties: {
    _id: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    createdAt: { type: 'number' },
    tags: { type: 'array' },
  },
}

export const ArkBookmarkSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'ArkMark',
  type: 'object',
  properties: {
    _id: { type: 'string' },
    url: { type: 'string' },
    comment: { type: 'string' },
    digest: { type: 'string' },
    embed: { type: 'string' },
    type: { type: 'string' },
    createdAt: { type: 'number' },
    collectionId: { type: 'string' },
  },
}
