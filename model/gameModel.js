const mongoose=require('mongoose');
const  gameSchema=mongoose.Schema({
    user_id:{
        type:String,
        required:true
    },
    user_choice:{
        type:String,
        enum:['red','green'],
        required:true
    }
    ,
    user_amount:{
        type:Number,
        required:true,
    },
    green_bet:{
        type:Number
    },
    red_bet:{
        type:Number
    },
    winner_color:{
        type:String,
        enum:["red","green"],
        default:null
    }
})
module.exports = mongoose.model('game', gameSchema);