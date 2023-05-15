// requiring my config file
const myConfigFile = require('../config/config');
// =========================

// using express
const express=require('express');
const userRoute = express();
// ===========================

userRoute.use(express.static('public'));

// using express session
const session = require('express-session');
userRoute.use(session({secret:myConfigFile.sessionSecret}))
// ===========================

// using a middleware to handle a session 
const auth = require('../middleware/auth');
// ===========================

// setting view engine
userRoute.set('view engine','ejs');
userRoute.set('views','./views/users')
// ============================

// using body-parser
const bodyparser = require('body-parser');
userRoute.use(bodyparser.json());
userRoute.use(bodyparser.urlencoded({extended:true}));
// ============================


// multer to upload image and save it to /public/userimages
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/userImages'))
    },
    filename:function(req,file,cb){
        const name = Date.now() + '-' + file.originalname;
        cb(null,name); 
    }
});
const upload = multer({storage:storage}) 
// ============================

// *********** ROUTES FOR SIGNUP *************
// using user controller to call load and insert methods
const userController=require('../controllers/usercontroller');
const { config } = require('process');
userRoute.get('/register',auth.isLogout,userController.loadRegister);
userRoute.post('/register',upload.single('image'),userController.insertUser);
// ============================

// using user controller to verify the email
userRoute.get('/verify',userController.verifyMail);
// ================================

// *************** ROUTES FOR LOGIN ************

userRoute.get('/login',auth.isLogout,userController.loginLoad);
userRoute.get('/',auth.isLogout,userController.loginLoad);

userRoute.post('/login',userController.verifyLogin);
userRoute.post('/',userController.verifyLogin);

// ************** ROUTES TO LOAD HOME PAGE ***********
userRoute.get('/home',auth.isLogin,userController.loadHome);
// ============================

// ************** LOGOUT ****************
userRoute.get('/logout',auth.isLogin,userController.userLogout);
// exporting the route to use it in index.js

// ************** FORGET PASSWORD *************
userRoute.get('/forget',auth.isLogout,userController.forgetLoad);
userRoute.post('/forget',userController.forgetVerify);
userRoute.get('/forget-password',auth.isLogout,userController.forgetPasswordLoad);
userRoute.post('/forget-password',userController.resetPassword);
// ===========================

// ************* Verifying the mail if not done at the time of registration ************
userRoute.get('/verification',userController.verificationLoad);
userRoute.post('/verification',userController.sendVerificationLink);
// ============================
module.exports = userRoute;
// ============================