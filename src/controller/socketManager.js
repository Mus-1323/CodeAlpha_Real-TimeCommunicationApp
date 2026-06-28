import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectTOSocket = (server) => {

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    }//a function that connect our socket to the backend server and this cors helps react can connect through any where 
  });
//who ever enter a app create the connection and give them a socket id
  io.on("connection", (socket) => {
//this is doing 3 thing this is joing the people can join the room 
    //  JOIN CALL it tells I want to join room X
    socket.on("join-call", (path) => {
      console.log("SOMETHING CONNECTED")
       //it create the room if not exisit
      if (!connections[path]) {
        connections[path] = [];
      }
      //this help to enter the user to the room
      connections[path].push(socket.id);
      timeOnline[socket.id] = new Date();//it store when user joined 

      // notify everyone in room
      connections[path].forEach((id) => {
        io.to(id).emit("user-joined", socket.id, connections[path]);//this tells that hey this user has joined and here is the updated list 
      });

      // send old messages
      if (messages[path]) {
        messages[path].forEach((msg) => {
          io.to(socket.id).emit(
            "chat-message",
            msg.data,
            msg.sender,
            msg["socket-id-sender"]
          );
        });
      }
    });


    //  SIGNAL (WEBRTC) //people connect to the vediocall
    socket.on("signal", (toId, msg) => {
      io.to(toId).emit("signal", socket.id, msg);
    });


    // CHAT //this helps in messaging //meassage comes and create
    socket.on("chat-message", (data, sender) => {
      //find which room is the user is 
      const room = Object.keys(connections).find((key) =>
        connections[key].includes(socket.id)
      );
      // if not found and room then return it 
      if (!room) return;
     //if there is not message in the room so create the message array in the room
      if (!messages[room]) {
        messages[room] = [];
      }
        // this tells that sender data
      const msgData = {
        sender,
        data,
        "socket-id-sender": socket.id
      };
      //push to the msg
      messages[room].push(msgData);
     //notify each one in the connection 
      connections[room].forEach((id) => {
        io.to(id).emit("chat-message", data, sender, socket.id);
      });
    });


    // DISCONNECT we can leave this through
    socket.on("disconnect", () => {
     //finds which room is the user present 
      for (const room in connections) {
         //once find 
        if (connections[room].includes(socket.id)) {

          // remove user
          connections[room] = connections[room].filter(
            (id) => id !== socket.id
          );

          // notify others
          connections[room].forEach((id) => {
            io.to(id).emit("user-left", socket.id);
          });

          // delete empty room
          if (connections[room].length === 0) {
            delete connections[room];
            delete messages[room];
          }

          break;
        }
      }

      delete timeOnline[socket.id];
    });

  });

  return io;
};
///*================= ZOOM CLONE FLOW =================

//1. CONNECTION
   //- user connects → socket.id created

//2. JOIN ROOM
  // - add user to room (connections)
  // - notify others "user-joined"
   //- send old messages (if any)

// 3. CHAT SYSTEM
//    - send + receive messages in room

// 4. SIGNALING (WEBRTC SETUP)
//    - forward offer/answer/ICE between users

// 5. WEBRTC
//    - browser creates direct video connection

// 6. DISCONNECT
//    - remove user from room
//    - notify others "user-left"

//===================================================