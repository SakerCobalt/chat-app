const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
//express creates a server in the background, but we need access to it for socket.io
const server = http.createServer(app) 
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

let count = 0
//This runs once for each new connection.
//
io.on('connection',(socket)=>{
  console.log('New Websocket connection.')

  socket.on('join',(options, callback)=>{
    const {error, user} = addUser({id:socket.id, ...options})

    if (error){
      return callback(error)
    }

    socket.join(user.room)

    socket.emit('message',generateMessage('Admin','Welcome!'))
    //broadcast excludes the current socket
    socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined.`))
    io.to(user.room).emit('roomData',{
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    callback()

    //io.to.emit - emits an event to everyone in a specific room
    //socket.broadcase.to.emil - sending an event to everyone except a specific client in a chat room

  })
  
  socket.on('sendMessage',(message, callback)=>{
    const user = getUser(socket.id)
    const filter = new Filter()

    if (filter.isProfane(message)){
      return callback('not allowed due to Profanity content.')
    }
    
    io.to(user.room).emit('message', generateMessage(user.username,message))
    callback()
  })

  socket.on('sendLocation',(coords,callback)=>{
    const user = getUser(socket.id)
    io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    callback()
  })

  //disconnect is a built in action, we don't need to emit it
  socket.on('disconnect',()=>{
    const user = removeUser(socket.id)

    if (user){
      //we don't need to broadcase because the socket has already disconnected.
      io.to(user.room).emit('Admin','message',generateMessage(`${user.username} has left.`))
      io.to(user.room).emit('roomData',{
        room:user.room,
        users: getUsersInRoom(user.room)
      })
    }
  })
})

server.listen(port,()=>{
  console.log(`Server is up on port ${port}!`)
})