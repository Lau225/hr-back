const Router=require('@koa/router')
const dbConfig=require('../api/config/dbconfig')
const users=require('../users')
const {generateToken}=require('../api/core/utils')
const auth=require('../api/middlewares/auth')
const tools=require('../api/config/for')
const res = require('express/lib/response')
const tokenRouter=new Router({
    // prefix:'token'
})

//登陆接口
tokenRouter.post("/login", async (ctx, next) => {
  let {username, password}=ctx.request.body
    let sql1 = `select * from admin where username='${username}' and password=${password}`;
  const res1 = await tools.packet(sql1);
  let rid=res1[0].rid
    const token=verifyUser(username,password,res1)
    if(!token){
        ctx.body={
            errCode:1001,
            msg:'用户名或密码不正确'
        }
        return
    }
    ctx.body= {
      token,
      username,
      rid
    }
});

//验证用户名和密码
function verifyUser(username,password,res1){
    const index=res1.findIndex(user=>{
        return user.username===username&&user.password===password
    })
    const user=res1[index]
    if(!user){
        return undefined
    }
    else{
        const token=generateToken(user.id,auth.USER)
        return token
    }
}

//获取权限
tokenRouter.post("/getPower", async (ctx, next) => {
  let rid=ctx.request.body.rid
  let sql = `SELECT * FROM role_module where rid in 
                (select id from role where id in
                (select rid from admin where rid='${rid}'))`;

  const result = await tools.packet(sql);
  ctx.body= {
        result
    }
})

//获取机构
tokenRouter.get("/getInstitutions", async (ctx, next) => {
  let sql1 = `select * from first_institutions `;
  let sql2 = `select * from second_institutions`;
  let sql3 = `select * from third_institutions`;
  const first_institutions = await tools.packet(sql1);
  const second_institutions = await tools.packet(sql2);
  const third_institutions = await tools.packet(sql3);
  ctx.body= {
        first_institutions,
        second_institutions,
        third_institutions,
    }
})

//获取职位分类和职位
tokenRouter.get("/getPosition", async (ctx, next) => {
  let sql1 = `select * from position `;
  let sql2 = `select * from position_type`;
 
  const position = await tools.packet(sql1);
  const position_type = await tools.packet(sql2);

  ctx.body= {
        position,
        position_type,
    }
})

//登记接口
tokenRouter.post('/filebuild', async (ctx, next) => {
  let {
    positionId,salaryId,TiId,name, fileId,gender, email, phone, qq, mobilePhone, address, zipCode, picture, country, birth_place,
    birthday, nation, religion, politicsStatus, idCard, socialNumber, age, education, educationYears,
    educationMajor, compensationStandards, openBank, bankNumber, registrant, advantage, hobby,
    resume,familyRelationship,comment
  
  } = ctx.request.body
  let sql2 = `SELECT id FROM user ORDER BY id DESC LIMIT 1`
  const res1 = await tools.packet(sql2);
  console.log(res1[0].id);
  let Codeid = res1[0].id+1
  if (Codeid<10) {
    Codeid="0"+Codeid
  }
  fileId = "2022" + fileId + Codeid

  let id = null
 
  let sql = `insert into user (id,fileId,name,gender,email,phone,qq,mobilePhone,address,zipCode,picture,country,birth_place,birthday,nation,religion,politicsStatus,idCard,socialNumber,age,education,educationYears,educationMajor,compensationStandards,openBank,bankNumber,registrant,advantage,hobby,resume,familyRelationship,comment,TiId,salaryId,positionId)
  values(${id},${fileId},'${name}','${gender}','${email}','${phone}','${qq}','${mobilePhone}','${address}','${zipCode}','${picture}','${country}','${birth_place}','${birthday}','${nation}','${religion}','${politicsStatus}','${idCard}','${socialNumber}','${age}','${education}','${educationYears}','${educationMajor}','${compensationStandards}','${openBank}','${bankNumber}','${registrant}','${advantage}','${hobby}','${resume}','${familyRelationship}','${comment}',${TiId},${salaryId},${positionId})`;
  // let sql = `insert into user(id,fileId,TiId,salaryId,positionId) values(${id},${fileId},${TiId},${salaryId},${positionId})`
  const res = await tools.packet(sql);
  console.log(res);
  ctx.body={
    msg:"登记成功"
  }
})

//获取薪资
tokenRouter.get('/getSalary', async (ctx, next) => {
  let sql = `select * from salary_standard`
  const result = await tools.packet(sql);
  console.log(result);
  ctx.body = {
    result
  }
})

//获取未复核的信息
tokenRouter.get('/getunrecheck', async (ctx, next) => {
  let sql = `select * from user where stateId = 2 `
  const result = await tools.packet(sql);
  let arr=[]
  for (const item of result) {
    let obj = {}
    let positionId = item.positionId
    let TiId=item.TiId
    let sql1 = `select name from position where id = ${positionId}`
    let sql2 = `select Fi_name,Si_name,Ti_name from first_institutions,second_institutions,third_institutions
                where first_institutions.Fi_id=second_institutions.FiId and
                second_institutions.Si_id=third_institutions.SiId and Ti_id=${TiId}`
    const result2 = await tools.packet(sql2);
    const result1 = await tools.packet(sql1);
    let { Fi_name, Si_name, Ti_name } = result2[0]
    console.log(Fi_name,Si_name,Ti_name);
    let positionName = result1[0].name
    let fileId = item.fileId
    let name = item.name
    let gender = item.gender
    obj = {
      "fileId": fileId, "name": name, "gender": gender, "Fi_name": Fi_name, "Si_name": Si_name,
      "Ti_name": Ti_name, "positionName": positionName
    }
    arr.push(obj)
  }

  ctx.body = {
    arr
  }
})
//通过档案编号查看复核信息
tokenRouter.post('/recheck', async (ctx, next) => {
  let fileId = ctx.request.body.fileId
  let sql = `select * from user where fileId=${fileId}`
  const result = await tools.packet(sql);
  let arr = result[0]
  let positionId = arr.positionId
  let TiId=arr.TiId
  let sql1 = `select name from position where id = ${positionId}`
  let sql3 = `select name from position_type where id in
              (select PtypeId from position where id = ${positionId})`
  let sql2 = `select Fi_name,Si_name,Ti_name from first_institutions,second_institutions,third_institutions
                where first_institutions.Fi_id=second_institutions.FiId and
                second_institutions.Si_id=third_institutions.SiId and Ti_id=${TiId}`
  const result2 = await tools.packet(sql2);
  const result3 = await tools.packet(sql3);
  const result1 = await tools.packet(sql1);
  console.log(result3);
  let position_type=result3[0].name
  let { Fi_name, Si_name, Ti_name } = result2[0]
  let positionName = result1[0].name
  ctx.body = {
    arr,Fi_name, Si_name, Ti_name ,positionName,position_type

  }
})
//修改复核
tokenRouter.post('/rechecked', async (ctx, next) => {
  let fileId = ctx.request.body.fileId
  let sql = `update user set stateId=1 where fileId=${fileId}`
  let sql1 = `update position set number=number+1 where id in(select positionId from user where
    fileId=${fileId})`
  const result = await tools.packet(sql);
  const result1 = await tools.packet(sql1);
  if (result != null) {
    ctx.body = {
    msg:'成功复核'
  }
  }
})

//档案查询
tokenRouter.get('/filequery', async (ctx, next) => {
  let sql1 = `select * from first_institutions`
  let sql2 = `select * from second_institutions`
  let sql3 = `select * from third_institutions`
  let sql4 = `select * from position_type`
  let sql5 = `select * from position`
  const first_institutions = await tools.packet(sql1);
  const second_institutions = await tools.packet(sql2);
  const third_institutions = await tools.packet(sql3);
  const position_type = await tools.packet(sql4);
  const position = await tools.packet(sql5);
  ctx.body = {
    first_institutions,second_institutions,third_institutions,position_type,position
  }
})
//查询复核的人
tokenRouter.get('/getrechecked', async (ctx, next) => {
  let sql = `select * from user where stateId = 1 `
  const result = await tools.packet(sql);
  let arr=[]
  for (const item of result) {
    let obj = {}
    let positionId = item.positionId
    let TiId=item.TiId
    let sql1 = `select name from position where id = ${positionId}`
    let sql2 = `select Fi_name,Si_name,Ti_name from first_institutions,second_institutions,third_institutions
                where first_institutions.Fi_id=second_institutions.FiId and
                second_institutions.Si_id=third_institutions.SiId and Ti_id=${TiId}`
    const result2 = await tools.packet(sql2);
    const result1 = await tools.packet(sql1);
    let { Fi_name, Si_name, Ti_name } = result2[0]
    console.log(Fi_name,Si_name,Ti_name);
    let positionName = result1[0].name
    let fileId = item.fileId
    let name = item.name
    let gender = item.gender
    obj = {
      "fileId": fileId, "name": name, "gender": gender, "Fi_name": Fi_name, "Si_name": Si_name,
      "Ti_name": Ti_name, "positionName": positionName
    }
    arr.push(obj)
  }

  ctx.body = {
    arr
  }
})
//删除接口
tokenRouter.post('/delete', async (ctx, next) => {
  let fileId = ctx.request.body.fileId
  let sql = `update user set stateId=3 where fileId=${fileId}`
  let sql2 = `select positionId from user where fileId=${fileId}`
  const result2 = await tools.packet(sql2);
  let positionId = result2[0].positionId
   let sql1 = `update position set number=number-1 where id in 
            (select positionId from user where positionId=${positionId})`
  const result = await tools.packet(sql);
  const result1 = await tools.packet(sql1);
  ctx.body = {
      msg:'成功删除'
    }
  
})
//获取删除的人
tokenRouter.get('/deletepeople', async (ctx, next) => {
  let sql = `select * from user where stateId=3`
  const result = await tools.packet(sql);
  console.log(result);
  let arr=[]
  for (const item of result) {
    let obj = {}
    let positionId = item.positionId
    let TiId=item.TiId
    let sql1 = `select name from position where id = ${positionId}`
    let sql2 = `select Fi_name,Si_name,Ti_name from first_institutions,second_institutions,third_institutions
                where first_institutions.Fi_id=second_institutions.FiId and
                second_institutions.Si_id=third_institutions.SiId and Ti_id=${TiId}`
    const result2 = await tools.packet(sql2);
    const result1 = await tools.packet(sql1);
    let { Fi_name, Si_name, Ti_name } = result2[0]
    console.log(Fi_name,Si_name,Ti_name);
    let positionName = result1[0].name
    let fileId = item.fileId
    let name = item.name
    let gender = item.gender
    obj = {
      "fileId": fileId, "name": name, "gender": gender, "Fi_name": Fi_name, "Si_name": Si_name,
      "Ti_name": Ti_name, "positionName": positionName
    }
    arr.push(obj)
  }

  ctx.body = {
    arr
  }
})
//恢复接口
tokenRouter.post('/restore', async (ctx, next) => {
  let fileId = ctx.request.body.fileId
  let sql = `update user set stateId=1 where fileId=${fileId}`
  let sql2 = `select positionId from user where fileId=${fileId}`
  const result2 = await tools.packet(sql2);
  let positionId = result2[0].positionId
   let sql1 = `update position set number=number+1 where id in 
            (select positionId from user where positionId=${positionId})`
  const result = await tools.packet(sql);
  const result1 = await tools.packet(sql1);
  ctx.body = {
      msg:'成功恢复'
    }
})
//添加薪酬标准
tokenRouter.post('/addsalary', async (ctx, next) => {
  let id=null
  let { name, totalSalary, developPeople, registerPeople, basicSalary, trafficSalary, lunchSalary, commSalary
    , endowmentInsurance, unemployInsurance, medicalInsurance, housingProvidentFund } = ctx.request.body
  let sql = `insert into salary_standard (id,name,totalSalary,developPeople,registerPeople,basicSalary,
              trafficSalary,lunchSalary,commSalary,endowmentInsurance,unemployInsurance,medicalInsurance
              ,housingProvidentFund) values(${id},'${name}',
                '${totalSalary}',
                '${developPeople}',
                '${registerPeople}',
                '${basicSalary}',
                '${trafficSalary}',
                '${lunchSalary}',
                '${commSalary}',
                '${endowmentInsurance}',
                '${unemployInsurance}',
                '${medicalInsurance}',
                '${housingProvidentFund}')`
  const res = await tools.packet(sql);
  console.log(res);
  ctx.body = {
    res
  }
                
})
  // 获取薪酬标准
tokenRouter.get('/getsalarystandard', async (ctx, next) => {
  let sql = `select id,name,registerPeople from salary_standard where stateId=2`
  const res = await tools.packet(sql);
  console.log(res);
  ctx.body = {
    res
  }
})
// 复核薪酬标准
tokenRouter.post('/salaryrecheck', async (ctx, next) => {
  let id = ctx.request.body.id
  let sql = `select * from salary_standard where id=${id}`
  const res = await tools.packet(sql);
  console.log(res);
  ctx.body = {
    res
  }
})
//复核薪酬通过
tokenRouter.post('/passsalaryrecheck',async (ctx, next) => {
  let message = ctx.request.body.message
  let id = ctx.request.body.id
  let sql = `update salary_standard set message='${message}',stateId=1 where id=${id}`
  const res = await tools.packet(sql);
  console.log(res);
  ctx.body = {
    msg:'复核通过'
  }
})
//获取薪酬通过
tokenRouter.get('/passsalaryrechecked', async (ctx, next) => {
  let sql = `select * from salary_standard where stateId=1`
  const res = await tools.packet(sql);
  console.log(res);
  ctx.body = {
    res
  }
})
//薪酬变更通过
tokenRouter.post('/passsalarychange', async (ctx, next) => {
  let { id,name, totalSalary,  basicSalary, trafficSalary, lunchSalary, commSalary
    , endowmentInsurance, unemployInsurance, medicalInsurance, housingProvidentFund } = ctx.request.body
  let sql = `update salary_standard 
              set name='${name}',
              totalSalary='${totalSalary}',
              basicSalary='${basicSalary}',
              trafficSalary='${trafficSalary}',
              lunchSalary='${lunchSalary}',
              commSalary='${commSalary}', 
              endowmentInsurance='${endowmentInsurance}',
              unemployInsurance='${unemployInsurance}',
              medicalInsurance='${medicalInsurance}',
              housingProvidentFund='${housingProvidentFund}'
              where id=${id}`
  const res = await tools.packet(sql);
  console.log(res);
  ctx.body = {
    res
  }
})


//获取添加职位
tokenRouter.get('/getjob', async (ctx, next) => {
  let sql = `select * from add_position`
  let sql2 = `select * from add_position_type`
  const res = await tools.packet(sql);
  const res2 = await tools.packet(sql2);
  ctx.body = {
    res,res2
  }
})

//添加职位
tokenRouter.post('/addjobs', async (ctx, next) => {
  let { ptId, pId } = ctx.request.body
  let sql1 = `select * from add_position where id=${pId}`
  let sql2 = `select * from add_position_type where id=${ptId}`
  let sql6 = `select name from position_type where name='实验员'`
  const res = await tools.packet(sql1);
  const res2 = await tools.packet(sql2);
  console.log(res[0]);
  let ptname = res2[0].name
  let ptnumber = res2[0].number
  const res6 = await tools.packet(sql6);
  if (res6[0] == undefined) {
    let sql3 = `insert into position_type (id,name,number) values(${ptId},'${ptname}',${ptnumber}) `
    const res3 = await tools.packet(sql3);
    console.log(res3); 
  }
  let pname = res[0].name
  let pnumber = res[0].number
  let sql4 = `insert into position values(${pId},'${pname}',${pnumber},${ptId}) `
  const res4 = await tools.packet(sql4);
  console.log(res4);
  let sql5 = `delete from add_position where id=${pId}`
  const res5 = await tools.packet(sql5);
  console.log(res5);
  ctx.body = {
    msg:'添加成功'
  }
})
//获取添加机构
tokenRouter.get('/addinstitutions', async (ctx, next) => {
  let sql1 = `select * from first_institutions `;
  let sql2 = `select * from add_second_institutions`;
  let sql3 = `select * from add_third_institutions`;
  const first_institutions = await tools.packet(sql1);
  const second_institutions = await tools.packet(sql2);
  const third_institutions = await tools.packet(sql3);
  ctx.body= {
        first_institutions,
        second_institutions,
        third_institutions,
    }
})

//添加机构
tokenRouter.post('/createinstutitions', async (ctx, next) => {
  let { fId, sId, tId } = ctx.request.body
  let sql1 = `select * from first_institutions`
  let sql2 = `select * from add_second_institutions where Si_id=${sId}`
  let sql3 = `select * from add_third_institutions where Ti_Id=${tId}`
  const res1 = await tools.packet(sql1);
  const res2 = await tools.packet(sql2);
  const res3 = await tools.packet(sql3);
  let Si_name = res2[0].Si_name
  let sql4 = `select Si_name from second_institutions where Si_name='生物科技公司'`
  const res4 = await tools.packet(sql4);
  if (res4[0] == undefined) {
    let sql5 = `insert into second_institutions  values(${sId},'${Si_name}',${fId}) `
    const res5 = await tools.packet(sql5);
    console.log(res5); 
  }
  let Ti_name = res3[0].Ti_name
  let sql6 = `insert into third_institutions  values(${tId},'${Ti_name}',${sId}) `
  const res6 = await tools.packet(sql6);
  let sql7 = `delete from add_third_institutions where Ti_Id=${tId}`
  const res7 = await tools.packet(sql7);
  ctx.body = {
    msg:'添加职位成功'
  }
})
//薪酬登记接口
tokenRouter.get('/test', async (ctx, next) => {
  let sql1 = `select TiId,count(TiId) as number from user where stateId=1 group by TiId`
  const res1 = await tools.packet(sql1);
  console.log(res1);
  let arr=[]
  for (const item of res1) {
    let obj = {}
    let TiId = item.TiId
    let number=item.number
    let sql2 = `select Ti_name,SiId from third_institutions where Ti_id=${TiId}`
    const res2 = await tools.packet(sql2);
    let Ti_name = res2[0].Ti_name
    let SiId = res2[0].SiId
    let sql3 = `select Si_name from second_institutions where Si_id=${SiId}`
    const res3 = await tools.packet(sql3);
    let Si_name = res3[0].Si_name
    let Fi_name = "集团"
    let sql4 = `select salaryId from user where TiId=${TiId}`
    const res4 = await tools.packet(sql4);
    var money=0
    for (const item of res4) {
      let salaryId = item.salaryId
      let sql5 = `select totalSalary from salary_standard where id=${salaryId}`
      const res5 = await tools.packet(sql5);
      money = parseFloat(res5[0].totalSalary) + money
    }
    money=money.toFixed(2)
    obj = { F: Fi_name, S: Si_name, T: Ti_name, number: number, money: money ,TiId:TiId}
    arr.push(obj)
  }
  ctx.body = {
    arr
  }
})
//获取薪酬登记未复核
tokenRouter.post('/test3', async (ctx, next) => {
  let TiId=ctx.request.body.TiId
  let sql1=`select user.fileId,user.name,basicSalary,trafficSalary,lunchSalary,commSalary,endowmentInsurance,unemployInsurance,medicalInsurance,housingProvidentFund,totalSalary,TiId from user,salary_standard
      where user.salaryId=salary_standard.id and
      user.stateId=1;`
  const res1 = await tools.packet(sql1);
  let arr=res1.filter(item => {
    return item.TiId==TiId
  })
  console.log(arr);
  ctx.body = {
    arr
  }
})
//提交薪酬登记 
tokenRouter.post('/test2', async (ctx, next) => {
  let { serialId, affiliationId, number,basicSalary} = ctx.request.body
  let sql1 = `insert into serial (serialId, affiliationId, number, basicSalaryTotal) 
              values(${serialId},${affiliationId},${number},'${basicSalary}')`
  const res1 = await tools.packet(sql1);
  ctx.body = {
    res1
  }
})

//复核薪酬
tokenRouter.get('/test4', async (ctx, next) => {
  let sql1 = `select * from serial where state=2`
  const res1 = await tools.packet(sql1);
  console.log(res1);
  let arr=[]
  for (const item of res1) {
    let obj = {}
    let TiId = item.affiliationId
    let serialId = item.serialId
    let number = item.number
    let basicSalaryTotal=item.basicSalaryTotal
    let sql2 = `select Ti_name,SiId from third_institutions where Ti_id=${TiId}`
    const res2 = await tools.packet(sql2);
    let Ti_name = res2[0].Ti_name
    let SiId = res2[0].SiId
    let sql3 = `select Si_name from second_institutions where Si_id=${SiId}`
    const res3 = await tools.packet(sql3);
    let Si_name = res3[0].Si_name
    let Fi_name = "集团"
    obj = { F: Fi_name, S: Si_name, T: Ti_name,number:number,serialId:serialId,basicSalaryTotal:basicSalaryTotal}
    arr.push(obj)
  }
  ctx.body = {
    arr
  }
})

//复核薪酬成功
tokenRouter.post('/test5', async (ctx, next) => {
  let serialId = ctx.request.body.serialId
  let sql = `update serial set state=1 where serialId=${serialId}`
  const res = await tools.packet(sql);
  ctx.body = {
    msg:'复核成功'
  }
})

//获取权限接口
tokenRouter.get('/power', async (ctx, next) => {
  let sql = `select username from admin where rid!=1`
  const res = await tools.packet(sql);
  ctx.body = {
    res
  }
})

//修改权限
tokenRouter.post('/changepower', async (ctx, next) => {
  let {username,rid}=ctx.request.body
  let sql = `update admin set rid=${rid} where username='${username}'`
  const res = await tools.packet(sql);
  ctx.body = {
    msg:'修改成功' 
  }
})
module.exports=tokenRouter