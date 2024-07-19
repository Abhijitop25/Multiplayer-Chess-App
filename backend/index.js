const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors')


const corsOptions = {
    origin:"*" , 
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));


const server = http.createServer(app);
const io = new Server(server);

let waitingQueue = [];

io.on("connection", (socket) => {
    console.log(socket.id);

    

  socket.on('find_partner', () => {
    if (waitingQueue.length > 0) {
      // Pair the user with the first user in the queue
      const partnerSocketId = waitingQueue.shift();
      const roomId = `${socket.id}#${partnerSocketId}`;
      
      // Assign roles
      

      socket.join(roomId);
      io.sockets.sockets.get(partnerSocketId).join(roomId);

      // Notify both users
      io.to(socket.id).emit('partner_found', {
        roomId,
        white : false
      });
      io.to(partnerSocketId).emit('partner_found', {
        roomId,
        white : true
      });
    } else {
      // Add the user to the waiting queue
      waitingQueue.push(socket.id);
    }
  });

  socket.on('play_move',({fen, roomId})=>{
    if (fen) {
        io.in(roomId).emit('move_made', { fen });
      }
  })
})

const PORT = process.env.PORT || 8800;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));