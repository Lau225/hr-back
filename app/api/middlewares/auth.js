const jwt=require('jsonwebtoken')
const basicAuth=require('basic-auth')
const {secretKey}=require('../config/config')
class Auth{
    constructor(level) {
        Auth.USER=2
        Auth.ADMIN=8
        this.level=level
    }
    get middleware(){
        return async (ctx,next)=>{
            const token=basicAuth(ctx.request)
            var errMsg="token不合法"
            if(!token||token.name==='null'){
                ctx.body={
                    errCode:1005,
                    msg:errMsg
                }
                return
            }

           try{
                var decoded=jwt.verify(token.name,secretKey)
           }catch(e){
                //1.token 不合法

               //2.token 合法过期 e.name tokenExpiredError
               if(e.name==='tokenExpiredError'){
                   errMsg='token已过期'
               }
               ctx.body={
                   errCode:1005,
                   msg:errMsg
               }
               return
           }
            if(decoded.scope<this.level){
                ctx.body={
                    errCode:1005,
                    msg:'权限不足'
                }
                return
            }
            await next()
        }
    }
    static  verifyToken(token){
        try{
            jwt.verify(token,secretKey)
            return true
        }catch(e){
            return false
        }
    }
}

module.exports=Auth