const mongoose = require("mongoose");

// user schema 
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    image:{         // storing a profile image using multer
        type:String,
        required:true
    },
    isVerified:{      // to check if the user has verified the email , default false
        type:Boolean,
        default:false
    },
    token:{
        type:String,
        default:''
    }
});
// ======================
const UserSchema = mongoose.model("User",userSchema);

// exporting userschema
module.exports = UserSchema;
// ======================
