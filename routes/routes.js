const express= require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const router = express.Router();
const Invitation = require('../models/invitation')
const User = require('../models/user')

router.get('/',checkAuthenticated,async (req,res)=>{
	const invitations=await Invitation.find({
		to:req.user.username,
		accepted:{'$ne':req.user.username},
		rejected:{'$ne':req.user.username}
	})
	// const privatei = await Invitation.find({to:req.user.username})
	// const publici = await Invitation.find({to:public})
	res.render('home',{ invitations : invitations })
})

router.get('/login',checkNotAuthenticated, function(req,res){
	res.render('login');
})

router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

router.get('/signup',checkNotAuthenticated,function(req,res){
	res.render('signup');
})

router.post('/signup', checkNotAuthenticated, async (req, res) => {

	let temp = await User.findOne({username: req.body.username });
	if(temp!=null){
		req.flash('error','Username already exists')
		return res.redirect('/signup');
	}
	console.log(req.body.username)
	// console.log(req.body.username.includes(" "));
	if(req.body.username.includes(" ")){
		req.flash('error','Username should not contain spaces')
		return res.redirect('/signup');
	}
	else if(req.body.username.includes(";")){
		req.flash('error','Username should not contain semicolon')
		return res.redirect('/signup');
	}
	// if(req.body.password!=req.body.cpassword){
	// 	req.flash('error','Match both the passwords')
	// 	res.redirect('/signup');
	// }
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    let tuser= new User();
    tuser.name=req.body.name;
	tuser.username=req.body.username;
	tuser.password=hashedPassword;
	tuser= await tuser.save();
    res.redirect('/login')
  } catch(e) {
    throw e
  }
})
router.post('/logout',function(req,res){
	req.logOut()
  	res.redirect('/login')
})
router.get('/home',checkAuthenticated,async (req,res)=>{
	const invitations=await Invitation.find({to:req.user.username})
	// const privatei = await Invitation.find({to:req.user.username})
	// const publici = await Invitation.find({to:publici})
	res.render('home',{ invitations : invitations })
	console.log(req.user.username);
})

router.get('/create',checkAuthenticated,function(req,res){
	res.render('create');
})
router.post('/create',checkAuthenticated,async (req,res)=>{
	let temp = new Invitation();
	temp.host =req.user.username;
	temp.date =req.body.date;
	temp.location =req.body.location;
	temp.header =req.body.header;
	temp.body =req.body.content;
	temp.footer =req.body.footer;

	if (req.body.type=='private') {
		temp.to=req.body.invitees.split(' ');
	}else {
		temp.to=['public'];
	}
	temp= await temp.save();
	res.redirect('/')
})

router.get('/read/:id',checkAuthenticated,async (req,res)=>{
	const invitation = await Invitation.findById(req.params.id);
	if(invitation.to.includes(req.user.username)==false&&invitation.host!=req.user.username){
		return res.redirect('/')
	}
	if(invitation.host==req.user.username){
		req.flash('user','user');
	}
	if(invitation.accepted.includes(req.user.username)){
		req.flash('user','accept');
	}
	res.render('read',{invitation:invitation});
})
router.post('/accept/:id',checkAuthenticated,async (req,res)=>{
	const invitation = await Invitation.findById(req.params.id);
	invitation.accepted.push(req.user.username);
	res.redirect('/');
	invitation= await invitation.save();
})
router.post('/rejct/:id',checkAuthenticated,async (req,res)=>{
	const invitation = await Invitation.findById(req.params.id);
	invitation.rejected.push(req.user.username);
	invitation= await invitation.save();
	res.redirect('/');
})
router.get('/accepted',checkAuthenticated,async (req,res)=>{
		const invitations=await Invitation.find({
		accepted:req.user.username,
	})
	// const privatei = await Invitation.find({to:req.user.username})
	// const publici = await Invitation.find({to:public})
	res.render('home',{ invitations : invitations })
})
router.get('/myevents',checkAuthenticated,async (req,res)=>{
		const invitations=await Invitation.find({
		host:req.user.username,
	})

	res.render('myevents',{ invitations : invitations })
})



function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}


module.exports=router;