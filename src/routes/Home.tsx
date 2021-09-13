import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Box, Grommet, grommet, Button, Select, Spinner, Text } from 'grommet'
import { ChromeMessage, Sender } from '../types'
import { getCurrentTabUId } from '../chrome/utils'
import Singleton from '../textile/instance'
import { ArkBookmark, ArkFolder } from '../textile/types'
import Bookmark from '../components/Bookmark'

export const Home = () => {
  const [value, setValue] = useState<ArkFolder>()
  const [options, setOptions] = useState([])
  const [disabled, setDisabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [bookmark, setBookmark] = useState<ArkBookmark>()
  const [errorMessage, setErrorMessage] = useState('')

  let { push } = useHistory()

  useEffect(() => {
    const instance = Singleton.getInstance()
    function fetchFolders() {
      instance
        .queryMyFolders()
        .then((result: ArkFolder[]) => {
          setDisabled(false)
          setOptions(result)
        })
        .catch(console.log)
    }
    if (instance.getIdentity()) {
      if (!instance.getClient()) {
        setTimeout(() => {
          fetchFolders()
        }, 1000)
      } else {
        fetchFolders()
      }
    } else {
      push('/login')
    }
  }, [push])

  return (
    <Grommet theme={grommet} full>
      <Box
        style={{ width: 400, height: 400, border: '1px solid #e3e3e3' }}
        pad="medium"
        gap="medium"
      >
        {bookmark && <Bookmark feed={bookmark} />}

        <Box
          style={{
            position: 'fixed',
            left: 0,
            bottom: 0,
            width: '100%',
            padding: 10,
            background: '#fff6ed',
          }}
        >
          <Select
            options={options}
            labelKey="title"
            valueKey="_id"
            value={[value]}
            onChange={({ option }) => setValue(option)}
          />
          <Text color="red">{errorMessage}</Text>
          <Box
            direction="row"
            align="center"
            justify="around"
            style={{ marginTop: 10 }}
          >
            <Button
              label="解析"
              disabled={disabled}
              style={{ width: 130 }}
              icon={isLoading ? <Spinner /> : null}
              onClick={() => {
                const message: ChromeMessage = {
                  from: Sender.React,
                  message: 'getBookmark',
                }
                setIsLoading(true)
                getCurrentTabUId((id) => {
                  if (id) {
                    chrome.tabs.sendMessage(id, message, (response) => {
                      setIsLoading(false)
                      try {
                        const result = JSON.parse(response)
                        console.log('###', result)
                        if (typeof result === 'object' && result.origin) {
                          setBookmark(result)
                        }
                      } catch (error) {
                        setErrorMessage(error.message)
                      }
                    })
                  }
                })
              }}
            />
            <Button
              primary
              disabled={!bookmark || isSaving}
              label="保存"
              style={{ width: 130 }}
              onClick={async () => {
                try {
                  const instance = Singleton.getInstance()
                  const _bm = { ...bookmark }
                  if (value) {
                    _bm.collectionId = value._id
                  }
                  _bm.createdAt = Date.now()
                  if (typeof _bm.refer === 'object') {
                    _bm.refer = JSON.stringify(_bm.refer)
                  }
                  await instance.createBookmarks([_bm])
                  window.close()
                } catch (error) {
                  setErrorMessage(error.message)
                }
              }}
            />
          </Box>
          <Text textAlign="center" style={{ marginTop: 6 }}>
            暂时只支持豆瓣广播、日记、小组和长评
          </Text>
        </Box>
      </Box>
    </Grommet>
  )
}
