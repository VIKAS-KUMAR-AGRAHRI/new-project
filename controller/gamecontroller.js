const userWallet=require("../model/wallet")
const gameModel = require("../model/gameModel")
module.exports={
    current:async(req,res)=>{
        try {
            console.log("check 1")
            const hitdb = await gameModel.find({}).select('red_bet green_bet');
            //  const red_Total_Amount=hitdb.red_bet;
             return res.json({responseCode:200,responseMessage:"successfull",responseResult:hitdb})
        } catch (error) {
            return res.json({responseCode:500,responseMessage:"Internal Server Error"})
        }
        
    },
    bet:async(req,res)=>{
        try {
            const user=await userWallet.findOne({user_id:req.body.user_id})
            
            if(!user){
                return res.json({responseCode:200,responseMessage:"User does not exist"})
            }
            if(req.body.user_amount<1){
                return res.json({responseCode:200,responseMessage:"Amount should be greater than 0"})
            }
            await userWallet.findByIdAndUpdate({_id:user._id},{$set:{wallet:(user.wallet-req.body.user_amount)}})
            if(req.body.user_choice=="red"){
                req.body.red_bet=req.body.user_amount
                req.body.green_bet=0
            }else if(req.body.user_choice=="green"){
                req.body.green_bet=req.body.user_amount
                req.body.red_bet=0
            }
            console.log(req.body.green_bet, "and",req.body.red_bet)

            const status=await gameModel.create(req.body);
            console.log('check 1')
            if(!status){
                return res.json({responseCode:400,responseMessage:"Try another bet"})
            }
            return res.json({responseCode:200,responseMessage:"Bet successfully"})
        } catch (error) {
            return res.json({responseCode:500,responseMessage:"Internal Server Error"})
        }
    }
}