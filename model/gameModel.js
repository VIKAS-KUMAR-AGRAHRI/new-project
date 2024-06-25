const mongoose=require('mongoose');
const {Schema}=mongoose
const  gameSchema=mongoose.Schema({
    game_id:{
        type: Schema.Types.ObjectId,
        ref: '',  // The model name should match the referenced model's name
    },
    user_id:{
        type:String,
        // required:true
    },
    user_choice:{
        type:String,
        enum:['red','green'],
        // required:true
    }
    ,
    user_amount:{
        type:Number,
        // required:true,
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
    },
    created_At: {
        type: Date,
        default: Date.now
    }
})
module.exports = mongoose.model('game', gameSchema);