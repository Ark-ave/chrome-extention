import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Box, Grommet, grommet, Button, Select } from 'grommet'
import { ChromeMessage, Sender } from '../types'
import { getCurrentTabUId, getCurrentTabUrl } from '../chrome/utils'
// import { getCollectionList, useClient, getThreadID } from '../textile'

export const Home = () => {
  const [value, setValue] = useState('')
  const [options, setOptions] = useState([])
  //   const { client } = useClient()

  const [url, setUrl] = useState<string>('')
  const [responseFromContent, setResponseFromContent] = useState<string>('')

  let { push } = useHistory()

  /**
   * Get current URL
   */
  useEffect(() => {
    getCurrentTabUrl((url) => {
      setUrl(url || 'undefined')
    })
  }, [])

  //   useEffect(() => {
  //     if (client) {
  //       getCollectionList(
  //         client,
  //         getThreadID('bafk6f3cgxihfmxkvzfgqualsfhm5t26dbvn2du2loxu5o5z63lt7hiy')
  //       )
  //         .then((list) => {
  //           setOptions(list)
  //           if (list.length) {
  //             setValue(list[0])
  //           }
  //         })
  //         .catch(console.log)
  //     }
  //   }, [client])

  const sendTestMessage = () => {
    const message: ChromeMessage = {
      from: Sender.React,
      message: 'Hello from React',
    }

    getCurrentTabUId((id) => {
      id &&
        chrome.tabs.sendMessage(id, message, (responseFromContentScript) => {
          setResponseFromContent(responseFromContentScript)
        })
    })
  }

  const sendRemoveMessage = () => {
    const message: ChromeMessage = {
      from: Sender.React,
      message: 'delete logo',
    }

    getCurrentTabUId((id) => {
      id &&
        chrome.tabs.sendMessage(id, message, (response) => {
          setResponseFromContent(response)
        })
    })
  }

  return (
    <Grommet theme={grommet} full>
      <Box
        style={{ width: 300, height: 200, border: '1px solid #e3e3e3' }}
        pad="medium"
        gap="medium"
      >
        <Select
          options={options}
          labelKey="title"
          valueKey="_id"
          value={[value]}
          onChange={({ option }) => setValue(option)}
        />
        <Button primary label="保存" />
      </Box>
    </Grommet>
    // <div className="App">
    //   <header className="App-header">
    //     <p>Home</p>
    //     <p>URL:</p>
    //     <p>{url}</p>
    //     <button onClick={sendTestMessage}>SEND MESSAGE</button>
    //     <button onClick={sendRemoveMessage}>Remove logo</button>
    //     <p>Response from content:</p>
    //     <p>{responseFromContent}</p>
    //     <button
    //       onClick={() => {
    //         push('/about')
    //       }}
    //     >
    //       About page
    //     </button>
    //   </header>
    // </div>
  )
}
