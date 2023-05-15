const usermodel = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const config = require('../config/config');
// ************** SIGN UP METHODS *********************
// securing password using bcrypt
const securePassword = async(password)=>{
    try {
        const passwordHash = bcrypt.hash(password , 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}
// ================================

// function to load the Register.ejs file
const loadRegister = async(req,res)=>{

    try {
        res.render('registration')
    } catch (error) {
        console.log(error);
    }
}
// =================================


// sending mail using nodemailer
const sendMail = async(name,email,user_id)=>{
    try {
        const transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTls:true,
            auth:{
                user:config.username,
                pass:config.password
            }
        });

        const mailDetails = {
            from:config.username,
            to:email,
            subject: 'Volcanic Verification',
            html:'<p>Hi' + name + ', please click here to <a href="http://localhost:5000/verify?id='+user_id+'"> Verify </a> your mail.</p>'
        }

        transporter.sendMail(mailDetails,function(error,info){
            if(error)
            {
                console.log(error.message);
            }
            else{
                console.log('mail sent successfully',info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}
// =================================

//verifying email function
const verifyMail = async(req,res)=>{

    try {
        const updateinfo = await usermodel.updateOne({_id:req.query.id}, { $set:{isVerified:true}});
        console.log(updateinfo);
        res.render('emailVerified');
    } catch (error) {
        console.log(error.message);
    }
}
// =================================

// function to insert the User in db
const insertUser = async(req,res)=>{
    try {
        const securepass = await securePassword(req.body.password);

        const UserModel = new usermodel({
            name:req.body.name,
            email:req.body.email,
            phone:req.body.phone,
            password:securepass, // inserting the hashed password to the db
            isVerified:false,
            image:req.file.filename
        });
        const userData = await UserModel.save();
        if(userData)
        {
            sendMail(req.body.name,req.body.email,userData._id);
            res.render('registration',{message:"your registration has been successfully completed , please verify your mail"})
        }
        else{
            res.render('registration',{message:"your registration has been failed"})
        }
    } catch (error) {
        console.log(error.message);
    }
}
// ===============================


// ************** LOGIN METHODS *******************
// function to load login .ejs file
const loginLoad = async(req,res)=>{

    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}
// function to verify login
const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await usermodel.findOne({email:email});
        if(userData)
        {
            const passMatch = await bcrypt.compare(password,userData.password);
            if(passMatch)
            {
                if(userData.isVerified === true){
                    req.session.user_id = userData._id;
                    res.redirect('/home');
                }
                else{
                    res.render('login',{message:'please verify your mail'});
                }
            }
            else{
                res.render('login',{message:'Email and password are incorrect'})
            }
        }
        else{
            res.render('login',{message:'Email and password incorrect'});
        }
    } catch (error) {
        console.log(error.message);
    }
}

// function to load home.ejs
const loadHome = async(req,res)=>{
    try {
        const userData = await usermodel.findById({_id:req.session.user_id});
        console.log(userData);
        res.render('home',{user:userData});
    } catch (error) {
        console.log(error.message);
    }
}
// ===========================

//  ********* LOGOUT **************
const userLogout = async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
}
// ==============================

// ************ forget password *******************

// load forget password function
const forgetLoad = async(req,res)=>{

    try {
        res.render('forget');
    } catch (error) {
        console.log(error.message);
    }
}
// ==============================

// sending and verifying forget password link
const forgetVerify = async(req,res)=>{
    try {
        const email = req.body.email;
        const userData = await usermodel.findOne({email:email})
        if(userData)
        {
            
            if(userData.isVerified){
                const randomString = randomstring.generate();
                const updatedData = await usermodel.updateOne({email:email},{$set:{token:randomString}});
                sendResetPasswodMail(userData.name,userData.email,randomString);
                res.render('forget',{message:'please check your mail to reset the password'});
            } 
            else{
                res.render('forget',{message:'verify your email first'})
            }
        }
        else{
            res.render('forget',{message:'email doesnt exist'})
        }
    } catch (error) {
        console.log(error.message);
    }
}
// sending mail for reseting password
const sendResetPasswodMail = async(name,email,token)=>{
    try {
        const transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTls:true,
            auth:{
                user:config.username,
                pass:config.password
            }
        });

        const mailDetails = {
            from:config.username,
            to:email,
            subject: 'Reset Password For Volcanic',
            html:'<p>Hi ' + name + ', please click here to <a href="http://localhost:5000/forget-password?token='+token+'">Reset your password</a> your mail.</p>'
        }

        transporter.sendMail(mailDetails,function(error,info){
            if(error)
            {
                console.log(error.message);
            }
            else{
                console.log('mail sent successfully',info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}
// =================================

const forgetPasswordLoad = async(req,res)=>{

    try {
        const token = req.query.token;
        const tokenData = await usermodel.findOne({token:token})
        if(tokenData){
            res.render('forget-password',{user_id:tokenData._id})
        }
        else{
            res.render('404',{message:'token is invalid'});
        }

    } catch (error) {
        console.log(error.message);
    }
}
// ========================================

// new password

const resetPassword = async(req,res)=>{
    try {
        const password = req.body.password;
        const user_id = req.body.user_id;
        const securepass = await securePassword(password);
        const updatedData = await usermodel.findByIdAndUpdate({ _id:user_id },{ $set:{ password:securepass , token:'' } });
        res.redirect("/")
    } catch (error) {
        console.log(error.message);
    }
}

// *************** FUNCTIONS FOR VERIFYING THE ACCOUNT IF NOT DONE AT THE TIME OF REGISTRATION **********

// loading verification page
const verificationLoad = async(req,res)=>{
    try {
        res.render('verification')
    } catch (error) {
        console.log(error.message);
    }
}

// send verification link
const sendVerificationLink = async(req,res)=>{
    try {
        const email = req.body.email;
        const userData = await usermodel.findOne({email:email})
        if(userData){
            if(userData.isVerified)
            {
                res.render('verification',{message:'this account is already verified'})
            }
            else{
                sendMail(userData.name,userData.email,userData._id);
                res.render('verification',{message:'the verification link has been sent to the entered email'})
            }
            
        }
        else{
            res.render('verification',{message:'this mail is not registered'})
        }
    } catch (error) {
        console.log(console.log(error.message));
    }
}

// exporting functions as an Object
module.exports = {
    loadRegister,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    forgetLoad,
    forgetVerify,
    sendResetPasswodMail,
    forgetPasswordLoad,
    resetPassword,
    verificationLoad,
    sendVerificationLink
}
// ================================