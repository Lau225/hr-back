const Router=require('@koa/router')
const users=require('../users')
const router=new Router()

router.get('/user',async ctx=>{
    ctx.body=users
})

router.post('/user',async ctx=>{
    //request
    const body=ctx.request.body

    const user={
        //主键 id
        id:Math.random(),
        username:body.username,
        password:body.password,
    }
    users.push(user)
    ctx.body={
        errorCode:0,
        msg:'创建用户成功',
        users:users
    }
})

module.exports=router