import { Box, Button, Layer } from 'grommet'
import React from 'react'

export default function DoneModal() {
  return (
    <Layer background="rgba(0,0,0,0.7)" style={{ zIndex: 1001 }}>
      <Box
        direction="column"
        align="center"
        justify="center"
        flex="grow"
        style={{ background: 'transparent' }}
        gap="large"
      >
        <Button
          label="前往"
          primary
          href="https://ark.chezhe.dev/feeds"
          target="_blank"
          style={{ textAlign: 'center', width: 200 }}
          onClick={() => {
            window.close()
          }}
        />
        <Button
          label="关闭"
          style={{ textAlign: 'center', width: 200, background: 'white' }}
          onClick={() => {
            window.close()
          }}
        />
      </Box>
    </Layer>
  )
}
