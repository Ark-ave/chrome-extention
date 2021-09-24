import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Box, Grommet, grommet, Button, TextArea } from 'grommet'
import Singleton from '../textile/instance'

export const Login = () => {
  const [identity, setIdentity] = useState('')
  let { push } = useHistory()
  return (
    <Grommet theme={grommet} full>
      <script src="/static/js/turndown.js"></script>
      <Box
        style={{ width: 400, height: 500, border: '1px solid #e3e3e3' }}
        pad="medium"
        gap="medium"
      >
        <TextArea
          placeholder="填入你的私钥"
          value={identity}
          style={{ height: 200 }}
          onChange={(e) => setIdentity(e.target.value)}
        />
        <Button
          primary
          label="登录"
          onClick={async () => {
            if (!identity.trim()) {
              return
            }
            const instance = Singleton.getInstance()
            await instance.login(identity)
            push('/')
          }}
        />

        <Button
          style={{ textAlign: 'center' }}
          label="注册"
          href="https://ark.chezhe.dev/signup"
          target="_blank"
        />
      </Box>
    </Grommet>
  )
}
