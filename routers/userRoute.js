const userRoute = require('express').Router();
const usercontroller = require('../controller/usercontroller');
const verifyToken = require('../middleware/userAuth');
const upload=require('../middleware/upload')
userRoute.post('/signin', usercontroller.SignIn);
userRoute.post('/signup', upload.single('file'),usercontroller.SignUp);

userRoute.post('/otpvarify', usercontroller.otpVarify);
userRoute.post('/resendotp',usercontroller.resendOtp);

userRoute.get('/profile', verifyToken.verifyToken, usercontroller.Profile);

userRoute.delete('/deleteuser', usercontroller.deleteUser);
userRoute.put('/updateuser', usercontroller.updateUser);

userRoute.post('/forgetPassword',usercontroller.Forget);
userRoute.post('/resetPassword',usercontroller.Reset);

userRoute.post('/updatePassword',usercontroller.updatePassword);

module.exports = userRoute;
