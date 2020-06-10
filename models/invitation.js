const mongoose = require('mongoose')

const invitationSchema = new mongoose.Schema({
  header: {
    type: String,
    required: true
  },
  body: {
    type: String, 
    required: true
  },
  footer: {
    type: String,
   
  },
  date:{
    type:String,
    required:true
  },
  location:{
    type:String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  host: {
    type: String,
    required: true
  },
  to:{
    type:[String],
    required:true
  },
  accepted:{
    type:[String]
  }
})
module.exports = mongoose.model('invitations', invitationSchema);