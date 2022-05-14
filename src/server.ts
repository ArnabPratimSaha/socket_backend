import express, { Application } from 'express';
import {Server as HttpServer} from 'http';
const app:Application=express();
import { Data } from './data/data';
import cors from 'cors';
const PORT=process.env.PORT||5000
import {Server,Socket,} from 'socket.io';
interface ServerToClientEvents {
    hello: () => void;
    userJoin: (userId:string,socketId:string, name:string) => void;
    userLeft: (userId:string,socketId:string) => void;
    sendMessage:(uid:string, msg:string)=>void;
    sendFocus:(uid:string)=>void;
    sendBlur:(uid:string)=>void;
    roomInfo:(users: Array<{
        name: string,
        id: string,
        sid: string,
    }>)=>void;
    sendCallAccept:(callerSid:string,data:any)=>void
    reciveCallAccept:(callerSid:string,data:any)=>void
  }
  
  interface ClientToServerEvents {
    hello: () => void;
    roomJoin:(rid:string, uid:string, name:string)=>void;
    roomLeave:(uid:string, rid:string)=>void
    sendCall:(userSid:string,senderSid:string,data:any)=>void
    reciveCall:(userSid:string,data:any)=>void;
    message:(uid:string, rid:string, msg:string)=>void
    onFocus:(uid:string, rid:string)=>void
    onBlur:(uid:string, rid:string)=>void
  }
  
  interface InterServerEvents {
    ping: () => void;
  }
  
  interface SocketData {
    name: string;
    age: number;
  }

const data:Data=new Data();

import path from 'path'
app.use(express.static( path.join(__dirname,'public')));
import HomeRoute from './routes/home';
app.use('/',HomeRoute);
app.use(cors());

const server:HttpServer= app.listen(PORT,()=>console.log(`Server running`))
const io:Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>=new Server(server,{
    cors: {
        origin: '*'
      }
})

io.on('connection',async(socket:Socket)=>{
    socket.on('roomJoin',async(rid:string,uid,name:string)=>{
        const socketIds=data.getSocketId(rid,uid);
        await socket.leave(socketIds[0]);
        data.removeUser(rid,uid);
        await socket.join(rid);
        data.addUser(rid,uid,socket.id,name);
        io.to(socket.id).emit('hello');
        io.to(rid).emit('roomInfo',data.getUsers(rid));
        io.to(rid).emit('userJoin',uid,socket.id,name)
    })
    socket.on('sendCall',(userSid:string,callerSid:string,data)=>{
        io.to(userSid).emit('sendCallAccept',callerSid,data);
    })
    socket.on('reciveCall',(userSid:string,data)=>{
        io.to(userSid).emit('reciveCallAccept',socket.id,data);
    })
    socket.on('onFocus',(uid:string,rid:string)=>{
        io.to(rid).emit('sendFocus',uid);
    })
    socket.on('onBlur',(uid:string,rid:string)=>{
        io.to(rid).emit('sendBlur',uid);
    })
    socket.on('message',(uid:string,rid:string,msg:string)=>{
        io.to(rid).emit('sendMessage',uid,msg);
    })
    socket.on("roomLeave",async(uid:string,rid:string)=>{
        await socket.leave(rid)
        data.removeUser(rid,uid);
        io.to(rid).emit('roomInfo',data.getUsers(rid));
        io.to(rid).emit('userLeft',uid,socket.id);
    })
    socket.on('disconnect',(r)=>{
        const {rid,uid}=data.removeUserBySocketId(socket.id);
        if(rid)io.to(rid).emit('roomInfo',data.getUsers(rid));
        if(rid&& uid)io.to(rid).emit('userLeft',uid,socket.id);
    })
})
export default io;