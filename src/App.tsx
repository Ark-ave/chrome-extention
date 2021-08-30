import { useState, useEffect } from 'react'
import { Box, Grommet, grommet, Button, Select } from 'grommet'
import './App.css'
import { getCollectionList, useClient, getThreadID } from './textile'

function App() {
  const { client } = useClient()
  const [value, setValue] = useState('')
  const [options, setOptions] = useState([])
  useEffect(() => {
    if (client) {
      getCollectionList(
        client,
        getThreadID('bafk6f3cgxihfmxkvzfgqualsfhm5t26dbvn2du2loxu5o5z63lt7hiy')
      )
        .then((list) => {
          setOptions(list)
          if (list.length) {
            setValue(list[0])
          }
        })
        .catch(console.log)
    }
  }, [client])
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
  )
}

export default App
