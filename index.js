// connecting to atlas
const mongoose = require('mongoose');
mongoose.connect("");
// =============================

// requiring express
const express = require("express");
const app = express();
// =============================

// using userRoute to access the userRoutes.js file
const userRoute = require('./routes/userRoutes')
app.use('/',userRoute);
// ===============================

// listening on port 5000
app.listen(5000,function(){
    console.log("server running at port 5000");
});
// ===============================