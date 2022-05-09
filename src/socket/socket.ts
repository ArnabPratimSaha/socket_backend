import io from "../server";
import {Socket} from 'socket.io'
io.on('connection',(socket:Socket)=>{
    socket.on('hi',(msg:string)=>{
        console.log(msg);
        socket.emit('hello',`Server has recieved the msg ${msg}`)
    })
})