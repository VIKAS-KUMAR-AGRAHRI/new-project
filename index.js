<<<<<<< HEAD
const express = require("express");
const app = express();
require("./db/conn");
require('./model/apisModel');
const userRoute = require("./routers/userRoute");
const adminRoute=require("./routers/subAdminRoute")
const bodyParser = require("body-parser");
const apisRoute = require("./routers/apisRoute");
const walletRoute = require("./routers/walletRoute");
const gameRoute = require("./routers/gameRoute");
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
require('dotenv').config();
const Port= process.env.PORT||3000;

app.get("/", (req, res) => {
    res.send(`<div style="text-align:center;padding-top:40px;">
    <h1>Hello world!</h1>
</div><img src="qrcode.png" alt="qr"> `);
});

app.use('/user',userRoute);
app.use('/admin',adminRoute);
app.use('/apis',apisRoute);
app.use('/wallet',walletRoute);
app.use('/game',gameRoute);
app.listen(Port, () => {
;    console.log(`server created successfully, running at port ${Port}`);
});
=======
const express=require('express')
const app=express()
app.listen(3000,()=>{
    console.log("server is running")
})
>>>>>>> d0373875308ff326aae48db577ff08a2d8db679c
