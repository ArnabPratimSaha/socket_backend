export interface User{
    name:string,
    id:string,
    sid:string
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
      this.rooms.push({id:rid,users:[{id:uid,sid,name}]});
      return;
    }
    r.users.push({id:uid,sid,name});
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
}