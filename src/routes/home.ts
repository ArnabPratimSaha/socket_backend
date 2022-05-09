import {Router,Request,Response,NextFunction} from 'express';
import path from 'path'
const router=Router();
router.get('/',(req:Request,res:Response,next:NextFunction)=>{
    res.sendFile(path.join(__dirname,'home.html'))
})

export default router;
