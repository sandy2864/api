const express= require('express');
const bodyParser=require('body-parser');
const cors=require('cors');
const bcrypt=require('bcrypt-nodejs');
const knex=require('knex')
const db=knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'sandy',
    database : 'facedetection'
  }
});
db.select('*').from('users').then(data=>{
	console.log(data);
})
const app=express();
app.use(bodyParser.json());
app.use(cors());

const database={
	users:[
	{
	id:'123',
	name:'sandy',
	email:'sandy@gmail.com',
	password:'sandy',
	entries:0,
	joined: new Date()
},
	{
	id:'124',
	name:'moto',
	email:'moto@gmail.com',
	password:'moto',
    entries:0,
	joined: new Date()
}
],
login:[
{

	id:'987',
	hash:'',
	email:'sandy@gmail.com'
}
]
}
app.get('/',(req,res)=>{
	res.json(database.users);

})
app.post('/signin',(req,res)=>{
db.select('email','hash').from('login')
.where('email', '=', req.body.email)
.then(data=>{
	const isValid=bcrypt.compareSync(req.body.password,data[0].hash);
	if(isValid){

	return db.select('*').from('users')
	.where('email', '=',req.body.email)
	.then(user=>{
		res.json(user[0])
	})
	.catch(err=> res.status(400).json('unable to get user'))
}else{
res.status(400).json("wrong credentials")
}
})
.catch(err=> res.status(400).json("wrong credentials"))
})


app.post('/register',(req,res)=>{

	const {email,name,password}=req.body;
	const hash=bcrypt.hashSync(password);
	db.transaction(trx=>{
		trx.insert({
          hash:hash,
          email:email
		})
		.into('login')
		.returning('email')
		.then(loginEmail=>{
			return trx('users')
			.returning('*')
			.insert({
				email:loginEmail[0],
				name:name,
				joined:new Date()
		
		})
    .then(user=>{

    	res.json(user[0])
    })
})
		.then(trx.commit)
		.catch(trx.rollback)
})

    .catch(err=> res.status(400).json("error in registration"))
   })
app.get('/profile:id',(req,res)=>{
	const{id}=req.params;
        db.select('*').from('users')
        .where({id})

		.then(user=>{
			if(user.length){
        	res.json(user[0]);
        }else{
              res.status(400).json("not found")
        }
    })
		.catch(err=> res.status(400).json("not found"))
})
app.put('/image',(req,res)=>{
const{id}=req.body;
db('users').where('id','=',id)
.increment('entries',1)
.returning('entries')
.then(entries=>{
	res.json(entries[0])
})
.catch(err=> res.status(400).json('unable to update entries'))
})
app.listen(3000,()=>{
console.log('this is running on port 3000');
})