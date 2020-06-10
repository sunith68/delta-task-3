const express= require('express');
const homeRouter=require('./routes/routes')
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash')
const passport = require('passport');
const app = express();
const initializePassport = require('./config/passport')


mongoose.connect('mongodb://localhost/invites', {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
})

initializePassport(passport)


app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(flash());

app.use(session({
  secret: 'two thousand twenty',
  resave: false,
  saveUninitialized: false
}));


app.use(express.static(__dirname + '/public'));

app.use(passport.initialize());
app.use(passport.session());

app.use('/',homeRouter);

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});



app.listen(5000,function(){
	console.log('you are listening to port 5000');
})