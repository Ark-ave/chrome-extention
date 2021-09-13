import React, { useEffect, useState } from 'react'
import { Box, Markdown, Text, Heading } from 'grommet'
import styled from 'styled-components'
import { ArkBookmark, BookmarkType } from '../textile/types'

const StyledP = styled.p`
  max-width: unset;
  line-height: 1.5;
`

const StyledImg = styled.img`
  display: block;
  width: 300px;
  max-height: 200px;
  object-fit: cover;
  margin: 8px auto;
`

export default function Bookmark({
  feed,
  isQuoted,
}: {
  feed: ArkBookmark
  isQuoted?: boolean
}) {
  const [refer, setRefer] = useState()
  useEffect(() => {
    try {
      const _refer = JSON.parse(feed.refer)
      setRefer(_refer)
    } catch (error) {
      setRefer(feed.refer)
    }
  }, [feed])

  if (!feed) {
    return null
  }

  const isArticle = [
    BookmarkType.DOUBAN_NOTE,
    BookmarkType.DOUBAN_TOPIC,
    BookmarkType.WECHAT_ARTICLE,
    BookmarkType.DOUBAN_REVIEW,
    BookmarkType.OTHER,
  ].includes(feed.type)

  return (
    <Box
      pad="medium"
      style={{
        background: isQuoted ? '#eee' : undefined,
        marginTop: isQuoted ? 10 : 0,
        position: 'relative',
        minHeight: isQuoted ? 'unset' : undefined,
        overflowY: isQuoted ? undefined : 'scroll',
      }}
    >
      <Box
        direction="row"
        align="center"
        justify="between"
        margin={{ bottom: '8px' }}
      >
        <Markdown>{feed.user}</Markdown>
      </Box>
      {isArticle ? (
        <Heading level="2">{feed.title}</Heading>
      ) : (
        <Markdown components={{ p: StyledP, img: StyledImg }}>
          {feed.title || ''}
        </Markdown>
      )}
      <Markdown components={{ p: StyledP, img: StyledImg }}>
        {feed.content || ''}
      </Markdown>
      {!!refer &&
        (typeof refer === 'string' ? (
          <Markdown>{refer}</Markdown>
        ) : (
          <Bookmark feed={refer as ArkBookmark} isQuoted />
        ))}

      {!isQuoted && (
        <Box
          direction="row"
          align="center"
          justify="between"
          style={{ margin: '10px 0' }}
        >
          <Text size="small">{`原文发布于 ${feed.pubtime}`}</Text>
          <Text size="small">{``}</Text>
        </Box>
      )}
    </Box>
  )
}
