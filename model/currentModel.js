const mongoose=require('mongoose')
const cron=require("node-cron")
const currentGame=mongoose.Schema({
    fixed_id:{
        type:Number,
        default:1
    },
    game_name:{
        type:String,
        default:"RedGreen"
    },
    created_At:{
        type:Date,
        default:Date.now()
    },
    end_At:{
        type:Date,
        default: () => new Date(Date.now() + 60 * 1000)
    }
})
const which_Game_is_running=mongoose.model("currentGame",currentGame);
module.exports=which_Game_is_running;

//After each 1 minut gameModel all collection will cleared and create same name collection with different
//game_id in gameModel collections..
//And this module currentGame also will cleared their own collection entry................

cron.schedule('* * * * *', () => {
    console.log('running a task every minute');
  });

