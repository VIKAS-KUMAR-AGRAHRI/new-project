const walletModel=require('../model/wallet');
module.exports={
  balance:async(req,res)=>{
        try {
            const userid=req.body.id
            const user=await walletModel.findOne({user_id:userid})
            if (!user){
                return res.json({responseCode:400,responseMessage:"User not found"})
            }
            return res.json({responseCode:200,responseMessage:"successfully fetched balance",Balance:user.wallet})
        } catch (error) {
            return res.json({responseCode:500,responseMessage:"Internal Server Error"})
        }
        
  },
  add:async(req,res)=>{
    try {
        const userid=req.body.id
        const user=await walletModel.findOne({user_id:userid})
        if (!user){
            return res.json({responseCode:400,responseMessage:"User not found"})
        }
        const update=await walletModel.findByIdAndUpdate({_id:user._id},{$set:{wallet:(user.wallet+req.body.balance)}},{ new: true })
        return res.json({responseCode:200,responseMessage:"successfully add balance",OldBalance:user.wallet,updated_balance:update.wallet})
    } catch (error) {
        return res.json(error)
    }
  
  }
}