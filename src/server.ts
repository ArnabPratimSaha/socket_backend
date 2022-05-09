import express, { Application } from 'express';
import {Server as HttpServer} from 'http';
const app:Application=express();
import { Data } from './data/data';


const PORT=process.env.PORT||5000
import {Server,Socket} from 'socket.io';
const data:Data=new Data();

import path from 'path'
app.use(express.static( path.join(__dirname,'public')));
import HomeRoute from './routes/home';
app.use('/',HomeRoute);


const server:HttpServer= app.listen(PORT,()=>console.log(`Server running`))
const io=new Server(server,{
    cors: {
        origin: "http://localhost:3000"
      }
})
io.on('connection',async(socket:Socket)=>{
    socket.on('roomJoin',async(rid:string,uid,name:string)=>{
        const socketIds=data.getSocketId(rid,uid);
        await socket.leave(socketIds[0]);
        data.removeUser(rid,uid);
        await socket.join(rid);
        data.addUser(rid,uid,socket.id,name);
        
        console.log(data.getUsers(rid).length);
        io.to(socket.id).emit('roomInfo',data.getUsers(rid));
        socket.to(rid).emit('roomInfo',data.getUsers(rid));
    })
    socket.on('onFocus',(uid:string,rid:string)=>{
        socket.to(rid).emit('sendFocus',uid);
    })
    socket.on('onBlur',(uid:string,rid:string)=>{
        socket.to(rid).emit('sendBlur',uid);
    })
    socket.on('message',(uid:string,rid:string,msg:string)=>{
        socket.to(rid).emit('sendMessage',uid,msg);
    })
    socket.on("roomLeave",async(uid:string,rid:string)=>{
        await socket.leave(rid)
        data.removeUser(rid,uid);
        socket.to(rid).emit('roomInfo',data.getUsers(rid));
    })
})
export default io;