import { createServer } from 'node:http';
import { Server } from "socket.io";
import express from 'express'

const app = express();
const server = createServer(app);
const io = new Server(server , {
    cors:{
        origin:'*'
    }
});

const room = 'group'
io.on('connection', (socket) => {
  console.log('a user connected' , socket.id) ;

socket.on("JoinRoom" , async (userName)=>{
  console.log(`${userName} had joined the group...`);
  await socket.join(room)

  //send to all that nayone had joined
  // io.to(room).emit("roomNotice" , userName)
  
  //brodacasting
  socket.to(room).emit("roomNotice" , userName)
})
socket.on('chatmessage' , (message)=>{
  socket.to(room).emit("chatmessage" , message)
})

socket.on('typing', (typingData)=>{
  socket.to(room).emit("typing" , typingData)
})
});

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});