import React, { useState, useEffect, ReactElement } from 'react'
import ReactDOM from 'react-dom/client';
import useWebSocket, { ReadyState } from 'react-use-websocket'
import * as uuid from 'uuid'
import {
  BrowserRouter as Router,
  Link,
  Routes,
  Route,
  useSearchParams
} from 'react-router-dom'
import './App.css'


interface MessageData {
  type: string
  text: string
  sender: string
}

const WS_URL = 'ws://127.0.0.1:8000'

const Room = () => {
  const [params] = useSearchParams()
  const [messageHistory, setMessageHistory] = useState<MessageData []>([])
  const [messageText, setmessageText] = useState('')
  const roomId = params.get('id')

  const clearMessage = () => setmessageText('')

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(WS_URL, {
    share: true,
    onMessage(event) {},
  })

  useEffect(() => {
    if (lastJsonMessage !== null) {
      setMessageHistory((prev) => prev.concat([lastJsonMessage.data]));
    }
  }, [lastJsonMessage, setMessageHistory]);

  const handleSendMessage = (event: any) => {
    sendJsonMessage({type: 'chat-message', roomId: roomId, text: messageText}, true)
    clearMessage()
    event.preventDefault()
  }

  const handleUpdateMessage = (event: any) => { setmessageText(event.target.value) }

  return (
      <div>
      <form onSubmit={handleSendMessage}>
        <input type="text" value={messageText} onChange={handleUpdateMessage} />
        <input type="submit" value="Submit" />
      </form>
      <div>
        {messageHistory.map((message, key) => {
          return (
            <div key={`message-${key}`}>
              {message ? message.text : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Link to={{
          pathname:'/room',
          search: `?id=${uuid.v4()}`
        }}>New Room</Link>}/>
        <Route path='/room/*' element={<Room />}/>
      </Routes>
    </Router>
  )
}

export default App
