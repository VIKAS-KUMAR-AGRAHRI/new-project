const bcrypt = require('bcrypt');
const users = require("../model/userModel");
const jwt = require("jsonwebtoken");
const secretKey = "secretkey";
module.exports = {

    login: async (req, res) => {
        try {
            const { email, password } = req.body

            if (!email || !password) {
                return res.json({responseCode:400,responseMessage: "Email and Password are required" })
            }
            const foundUser = await users.findOne({ $and: [{ email: email }, { userType: "ADMIN" }] })
          
            if (!foundUser) {
                return res.json({responseCode:401,responseMessage: "User not found" })
            }

            if (foundUser.userType !== "ADMIN") {
                return res.json({responseCode:404,responseMessage: "Unauthorized Access" })
            }

            const isCorrectPassword = await bcrypt.compare(password, foundUser.pass)

            if (!isCorrectPassword) {
                return res.json({responseCode:401,responseMessage: "password not matched" })
            }
            console.log("id of founded user",foundUser._id)
            const data = {
                id: foundUser.id,
                userType:foundUser.userType
              };
              console.log("login successfully user", foundUser);
    
              jwt.sign({ data }, secretKey, { expiresIn: "300s" }, (err, token) => {
                return res.json({
                  responseCode: 200,
                  responseMessage: "Successfully login",
                  token: token,
                  _id: foundUser.id,
                });
              });
        }
        catch (error) {
            console.error(error)
            return res.json({responseCode:500,responseMessage: "Internal Server Error" })
        }
    },


    getAllUser: async (req, res) => {
        // return res.json("ehelloekek");
        try {
            if (!req.user || !req.user.data.userType == "ADMIN") {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            const allUsers = await users.find({ $and: [{ userType: "USER" }, { statusCode: "ACTIVE" }] })

            return res.json({responseCode:201,responseMessage: "All Users are fetched successfully", allUsers })
        }
        catch (error) {
            console.error(error)
            res.json({responseCode:500,responseMessage: "Error in fetching Users" })
        }
    },

    changeUserStatus: async (req, res) => {
        try {
            const { id } = req.query;
            console.log(req.user.data.userType)
            if (!req.user || req.user.data.userType!== "ADMIN") {
                return res.json({responseCode:403,responseMessage: 'Unauthorized, only admin are allowed to update or change the user status' });
            }

            if (!req.body.hasOwnProperty('statusCode')) {
                return res.json({responseCode:400,responseMessage: 'status not found' });
            }

            const newStatus = req.body.statusCode.toUpperCase();
            if (!['ACTIVE', 'BLOCK'].includes(newStatus)) {
                return res.json({responseCode:400,responseMessage: 'Invalid status, must be ACTIVE or BLOCK only' });
            }

            const foundUser = await users.findById({ _id: id });

            if (!foundUser) {
                return res.json({responseCode:404,responseMessage: 'User not found' });
            }

            if (foundUser.status === newStatus) {
                return res.json({responseCode:400,responseMessage: 'User already has the requested status' });
            }

            foundUser.statusCode = newStatus;
            await foundUser.save();
            return res.json({responseCode:200,responseMessage: `User status updated to ${newStatus}` });
        } catch (error) {
            console.error(error);
            return res.json({responseCode:500,responseMessage: 'Internal Server Error' });
        }
    },

    getUserById: async (req, res) => {
        const { id } = req.query
        try {

            if (!req.user || req.user.data.userType !== "ADMIN") {
                return res.json({responseCode:403,responseMessage: 'Unauthorized' });
            }

            const user = await users.findOne({ _id: id, statusCode: "ACTIVE" })
            if (!user) {
                return res.json({responseCode:404,responseMessage: "not found" })
            }
            return res.json({responseCode:200,responseMessage: "User data fetched successfully", user })
        }
        catch (error) {
            return res.json({responseCode:500,responseMessage: "Internal Server Error" })
        }
    },

    createUser: async (req, res) => {
        const { firstName, lastName, email, password, phoneNo, isVerified, status, userType } = req.body

        try {

            if (!req.user || req.user.data.userType !== "ADMIN") {
                return res.json({responseCode:403,responseMessage: 'Unauthorized' });
            }

            if (!firstName || !lastName || !email || !password) {
                return res.json({responseCode:400,responseMessage: "Please fill the required fields" })
            }

            const existingUser = await users.findOne({ $and: [{ email: email }, { statusCode: "ACTIVE" }] })

            if (existingUser) {
                return res.sjson({responseCode:400,responseMessage: 'Email already exists' });
            }

            const newUser = new users({
                firstName: firstName,
                lastName: lastName,
                email: email,
                countryCode:"+91",
                mobile: phoneNo,
                pass: password,
                statusCode:status,
                userType: userType,
                otpVarify:isVerified,
            })
            if (newUser.userType == "ADMIN") {
                return res.json({responseCode:403,responseMessage: "You are not authorized to create users with the ADMIN role" })
            }
            const savedUser = await newUser.save();
            return res.json({responseCode:200,responseMessage: "User created Successfully", savedUser })
        }
        catch (error) {
            console.error(error);
            res.json({responseCode:500,responseMessage: 'Internal Server Error' });
        }
    },

    getAdmin: async (req, res) => {

        try {
            if (!req.user || req.user.data.userType !== "ADMIN") {
                return res.json({responseCode:403,responseMessage: 'Unauthorized, only admin are allowed to update or change the user status' });
            }

            const admin = await users.find({ $and: [{ userType: "ADMIN" }, { statusCode: "ACTIVE" }] })
            return res.json({responseCode:200,responseMessage: "Admin fetched successfully", admin })
        }
        catch (err) {
            console.error(err)
            return res.json({responseCode:500,responseMessage: "Internal Server Error" })
        }
    }

}
// module.exports=adminController;




