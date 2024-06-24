const express = require('express');
const middleWareToken=require('../middleware/userAuth')
const adminController = require('../controller/admincontroller');
const adminRoutes = express.Router();

// admin Auth routes

adminRoutes.post('/signin', adminController.login)

// admin functionality routes

adminRoutes.get('/allUsers', middleWareToken.verifyToken, adminController.getAllUser)

adminRoutes.put('/login/:id/status', middleWareToken.verifyToken, adminController.changeUserStatus)

adminRoutes.get('/users/:id', middleWareToken.verifyToken, adminController.getUserById)

adminRoutes.post('/create/user', middleWareToken.verifyToken, adminController.createUser)

adminRoutes.get('/getAdmin', middleWareToken.verifyToken, adminController.getAdmin)


module.exports=adminRoutes;
