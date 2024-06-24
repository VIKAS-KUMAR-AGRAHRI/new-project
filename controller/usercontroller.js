const usermodel = require("../model/userModel");
const domail = require("../Common/mail");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const otpgeneration = require("../Common/otpgeneration");
const secretKey = "secretkey";
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const fs = require('fs');
const path = require('path');
dotenv.config();

const walletModel=require('../model/wallet');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = {
  SignIn: async (req, res) => {
    try {
      let oneuser = await usermodel.findOne({
        $or: [{ email: req.body.email }, { mobile: req.body.mobile }],
      });
      if (!oneuser) {
        // console.log("login unsuccessfullll...");
        return res.json({
          responseCode: 404,
          responseMessage: "Data not exist",
        });
      } else {
        const passwordMatch = bcrypt.compareSync(req.body.pass, oneuser.pass);

        if (passwordMatch) {
          const data = {
            id: oneuser.id,
          };
          console.log("login successfully user", oneuser);

          jwt.sign({ data }, secretKey, { expiresIn: "300s" }, (err, token) => {
            return res.json({
              responseCode: 200,
              responseMessage: "Successfully login",
              token: token,
              _id: oneuser.id,
            });
          });
        } else {
          return res.json({
            responseCode: 401,
            responseMessage: "Invalid email or password",
          });
        }
      }
    } catch (error) {
      return res.json({
        responseCode: 500,
        responseMessage: "Internal Server Error",
        responseResult: error,
      });
    }
  },
  SignUp: async (req, res) => {
    try {
      console.log(req.body);
  
      const query = {
        $and: [
          { $or: [{ mobile: req.body.mobile }, { email: req.body.email }] },
          { statusCode: { $ne: "DELETE" } },
        ],
      };
  
      const model = await usermodel.findOne(query);
  
      if (model) {
        if (req.body.email == model.email) {
          return res.json({
            responseCode: 404,
            responseMessage: "Email already exists",
          });
        } else if (req.body.mobile == model.mobile) {
          return res.json({
            responseCode: 404,
            responseMessage: "Mobile number already exists",
          });
        }
      } else {
        // Generate OTP and hash password
        req.body.otp = otpgeneration.otpgeneration();
        req.body.otpTime = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
        req.body.pass = bcrypt.hashSync(req.body.pass, 10);
  
        // Send OTP mail
        domail(req.body.email, "Otp verification", `Your otp is ${req.body.otp}`);
        console.log(req.file)
        if (req.file) {
         
        const folderPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }

       
        const filePath = path.join(folderPath, req.file.originalname);
        fs.writeFileSync(filePath, req.file.buffer);

          cloudinary.uploader.upload_stream({ resource_type: "raw" }, async (error, result) => {
            if (error) {
              return res.status(500).json({ error: 'Upload failed' });
            }
  
            req.body.profileImage = result.url;
            
            // fs.unlinkSync(filePath);
           
            const save = await new usermodel(req.body).save();
            await walletModel.ins
            return res.status(200).json({
              responseCode: 200,
              responseMessage: "Signup successfully",
              responseResult: save,
            });
          }).end(req.file.buffer);
        } else {
          
          const save = await new usermodel(req.body).save();
          //wallet default id set ........
          const walletbalance=await walletModel.create({user_id:save._id});
          return res.status(200).json({
            responseCode: 200,
            responseMessage: "Signup successfully",
            responseResult: save,
            wallet:walletbalance
          });
        }
      }
    } catch (error) {
      return res.status(500).json({
        responseCode: 500,
        responseMessage: "Something went wrong",
        responseResult: error,
      });
    }
  },
  otpVarify: async (req, res) => {
    try {
      const userfind = await usermodel.findOne({
        $or: [{ email: req.body.email }, { mobile: req.body.mobile }],
      });
      if (!userfind) {
        return res.json({
          responseCode: 404,
          responseMessage: "User does not Exist!",
        });
      } else {
        const curTime = Date.now();
        if (curTime > userfind.otpTime) {
          return res.json({
            responseCode: 400,
            responseMessage: "OTP Expired",
          });
          //here we give New otp generation resend functionality
        } else {
          // console.log((Number(req.body.otp))===(Number(userfind.otp)));
          if (Number(req.body.otp) == Number(userfind.otp)) {
            //then do otpVarify status True in the database
            const update = await usermodel.findByIdAndUpdate(
              { _id: userfind._id },
              { $set: { otpVarify: true } },
              { new: true }
            );
            if (update) {
              return res.json({
                responseCode: 200,
                responseMessage: "OTP successfully verify.",
              });
            }
            // res.send('hello from matched');
          } else {
            //Otherwise provided otp not matched to generated otp
            //And give Resend option to resend otp at the gmail
            return res.json({
              responseCode: 400,
              responseMessage: "OTP does not matched",
            });
          }
        }
      }
    } catch {
      return res.json({
        responseCode: 500,
        responseMessage: "Internal Server Error!",
      });
    }
  },

  resendOtp: async (req, res) => {
    try {
      const userfind = await usermodel.findOne({
        $or: [{ email: req.body.email }, { mobile: req.body.mobile }],
      });
      if (!userfind) {
        return res.json({
          responseCode: 404,
          responseMessage: "User does not Exist!",
        });
      } else {
        const otp = otpgeneration.otpgeneration();
        const info = domail(
          req.body.email,
          "Otp verification",
          `Your otp is ${otp}`
        );
        const otpTime = Date.now() + 10 * 50 * 1000;
        const update = await usermodel.findByIdAndUpdate(
          { _id: userfind._id },
          { $set: { otp: otp, otpTime: otpTime } }
        );
        return res.json({
          responseCode: 200,
          responseMessage: "Again Otp send successfully",
          responseResult: update,
        });
      }
    } catch {
      return res.json({
        responseCode: 500,
        responseMessage: "Internal Server Error!",
      });
    }
  },

  deleteUser: async (req, res) => {
    //This module related to soft deletetion of user..................................................................
    try {
      let deleteuser = await usermodel.updateOne(
        { _id: req.query._id },
        { statusCode: "DELETE" }
      );
      if (deleteuser) {
        console.log("deletion successfully....");
        return res.json({ responseCode: 200, responseMessage: "successfulll" });
      } else {
        console.log("deletion unsuccessfullll");
        return res.json({
          responseCode: 500,
          responseMessage: "there is something error.",
        });
      }
    } catch (error) {
      return res.json({
        responseCode: 500,
        responseMessage: "Internal Server Error",
      });
    }
  },

  updateUser: async (req, res) => {
    const newdata = { firstName: req.query.name };
    const filter = { mobile: req.query.mobile };
    let search = await usermodel.findOneAndUpdate(filter, newdata, {
      new: true,
    });
    if (search) {
      return res.json({
        responseCode: 200,
        responseMessage: `user ${search.firstName} data updated successfully`,
      });
    } else {
      return res.json({
        responseCode: 500,
        responseMessage: "there is some error in updating data of user data",
      });
    }
  },

  updatePassword: async (req, res) => {
    try {
      const query = {
        $or: [{ email: req.body.email }, { mobile: req.body.mobile }],
      };
      const search = await usermodel.findOne(query);
      console.log(search);
      if (!search) {
        return res.json({
          responseCode: 404,
          responseMessage: "Data Not Found",
        });
      }
      if (req.body.pass === req.body.cpass) {
        console.log("check 1");
        const encryptedpass = req.body.pass;
        const update = await usermodel.updateOne(
          { _id: search._id },
          { $set: { pass: encryptedpass } }
        );
        console.log("check 2");
        if (!update) {
          return res.json({
            responseCode: 404,
            responseMessage: "Password Not updated",
          });
        }

        return res.json({
          responseCode: 200,
          responseMessage: "Password updated successfull",
        });
      } else {
        return res.json({
          responseCode: 400,
          responseMessage: "Password and Confirm Password does not matched",
        });
      }
    } catch (error) {
      return res.json({
        responseCode: 500,
        responseMessage: "Internal Server Error",
      });
    }
  },

  Profile: async (req, res) => {
    try {
      const profile = await usermodel.findOne({ _id: req.user.data.id });
      return res.json({
        responseCode: 200,
        responseMessage: "successfully fetched",
        responseResult: profile,
      });
    } catch {
      return res.json({
        responseCode: 500,
        responseMessage: "Internal Server Error",
      });
    }
  },

  Forget: async (req, res) => {
    try {
      const email = req.body.email;
      const search = await usermodel.findOne({ email: email });
      console.log("it is working");
      if (!search) {
        return res.json({
          responseCode: 400,
          responseMessage: "Email does not Exist!",
        });
      } else {
        const link =
          "http://localhost:4500/user/resetPassword?id=" + search._id;
        const info = domail(
          email,
          "Reset Your Password",
          `use this link ${link}`
        );
        return res.json({
          responseCode: 200,
          responseMessage: "Link Sent successfully",
          userid: search._id,
        });
      }
    } catch {
      return res.json({
        responseCode: 500,
        responseMessage: "Internal Server Error",
      });
    }
  },
  Reset: async (req, res) => {
    try {
      const id = req.body.id;
      const search = await usermodel.findById({ _id: id });
      if (!search) {
        return res.json({
          responseCode: 400,
          responseMessage: "Id is not valid!",
        });
      } else {
        if (req.body.pass === req.body.cpass) {
          req.body.pass = bcrypt.hashSync(req.body.pass, 10);
          const update = await usermodel.updateOne(
            { _id: id },
            { $set: { pass: req.body.pass } }
          );
          if (!update) {
            return res.json({
              responseCode: 400,
              responseMessage: "Password Not updated",
            });
          } else {
            return res.json({
              responseCode: 200,
              responseMessage: "Password updated successfully",
            });
          }
        }
      }
    } catch {
      return res.json({
        responseCode: 500,
        responseMessage: "Internal Server Error",
      });
    }
  },
};
