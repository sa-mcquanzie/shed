import { WebSocket, WebSocketServer } from 'ws'
import * as http from 'http'
import * as uuid from 'uuid'


interface User {
  userId: string
  name?: string
}

interface ChatMessage {
  room: string
  sender: string
  text: string
  timestamp: number
}

interface Room {
  roomId: string
  members: Array<User>
  messages: Array<ChatMessage>
}

const port = 8000
const clients = {}
const rooms = new Array<Room>
const messages = new Array<ChatMessage>
const httpServer = http.createServer()
const wsServer = new WebSocketServer({ server: httpServer })

httpServer.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`)
})

function broadcastMessage(json) {
  const data = JSON.stringify(json)

  for(let userId in clients) {
    let client = clients[userId]

    if(client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  }
}

const handleMessage = (data, userId) => {
  switch (data.type) {
    case 'chat-message':
      const messageData = JSON.parse(data.toString())

      const newChatMessage: ChatMessage = {
        room: messageData.roomId,
        text: messageData.text,
        sender: userId,
        timestamp: Date.now()
      }

      let room = rooms.find(room => room.roomId === newChatMessage.room)
    
      room && room.messages.push(newChatMessage)
      broadcastMessage(newChatMessage)
    
      console.log(`${userId} sent a message`, newChatMessage) 
      break

    case 'create-room':
      const newRoom: Room = {
        roomId: data.roomId,
        members: [{userId: data.sender}],
        messages: []
      }

      rooms.push(newRoom)

      console.log(`${newRoom.members[0]} created a new room at ${newRoom.roomId}`)
      break
    default:
      break
  }
}

wsServer.on('connection', (connection) => {
  const userId = uuid.v4()
  clients[userId] = connection

  console.log(`New Connection from ${userId}`)

  connection.on('error', console.error)
  connection.on('message', (message) => handleMessage(message, userId))
})
