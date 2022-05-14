export interface User{
    name:string,
    id:string,
    sid:string,
    isMuted:boolean,
    isPaused:boolean
  }
export interface Room{
  id:string,
  users:Array<User>
}
export class Data {
  private rooms:Array<Room>
  constructor() {
    this.rooms=[];
  }
  public getUsers=(rid:string):Array<User>=> {
    const r=this.rooms.find(r=>r.id==rid);
    if(!r)return [];
    return r.users;
  }
  public addUser=(rid:string,uid:string,sid:string,name:string):void=> {
    const r=this.rooms.find(r=>r.id==rid);
    if(!r){
      this.rooms.push({id:rid,users:[{id:uid,sid,name,isMuted:false,isPaused:false}]});
      return;
    }
    r.users.push({id:uid,sid,name,isMuted:false,isPaused:false});
  }
  public removeUser=(rid:string,uid:string):void=> {
    const r=this.rooms.find(r=>r.id==rid);
    if(!r)return;
    r.users=r.users.filter(u=>u.id!==uid);
  }
  public getSocketId=(rid:string,uid:string):Array<string>=> {
    const r=this.rooms.find(r=>r.id==rid);
    if(!r)return [];
    return r.users.filter(u=>u.id===uid).map(o=>o.sid);
  }
  public removeUserBySocketId=(sid:string):{uid:string|undefined,rid:string|undefined}=> {
    let rid:string|undefined;
    let uid:string|undefined;
    this.rooms.forEach(r=>{
      r.users.forEach((u,i)=>{
        if(u.sid===sid){
          
          r.users=r.users.filter(us=>{
            if(us.sid===sid)uid=us.id;
            return us.sid!==sid
          });
          rid=r.id;
        }
      })
    })
    return {uid,rid};
  }
}