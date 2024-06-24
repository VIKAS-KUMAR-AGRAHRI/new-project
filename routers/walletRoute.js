const walletRoute=require('express').Router();
const walletController=require('../controller/walletcontroller');

walletRoute.get('/balance',walletController.balance);
walletRoute.post('/addbalance',walletController.add)

module.exports=walletRoute;