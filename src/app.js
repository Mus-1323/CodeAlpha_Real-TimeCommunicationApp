import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { connectTOSocket } from "./controller/socketManager.js";
import  userRoute from "./routes/usercreate.js";
dotenv.config();


const app = express();
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ extended: true, limit: "40kb" }));
app.use("/api/v1/users",userRoute);



const server = createServer(app);//express+server
//server (expres) se socket.io
const io = connectTOSocket(server);

const PORT = process.env.PORT || 3000;

app.get("/home", (req, res) => {
  res.send("hello");
});


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected 🔥");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });