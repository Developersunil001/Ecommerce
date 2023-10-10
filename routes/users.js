var mongoose = require("mongoose");
var passportLocalMongoose = require('passport-local-mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/flipkartt").then(function(){
  console.log('connected to db');
})

var userSchema = mongoose.Schema({
  username : String,
  name:String,
  gstno:{
    type:String,
    default:''
  },
  isseller:{
    type:Boolean,
    default:false
  },
  pic:String,
  password:String,
  products:[{ 
    type:mongoose.Schema.Types.ObjectId,
    ref:"product"
  }], 
  address:{
    type:String,
    default:''
  },
  contactnumber:String,
  email:String

})
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("user",userSchema);