const userWallet = require("../model/wallet");
const gameModel = require("../model/gameModel");
const which_Game_is_running = require("../model/currentModel");
module.exports = {
    timer: async (req, res) => {
        try {
            // Fetch the game details with fixed_id = 1
            const game = await which_Game_is_running.findOne({ fixed_id: 1, game_Status: true }).sort({ created_At: -1 }).exec();

            // Calculate remaining time in seconds
            const remainingTime = Math.floor((Date.now()-game.end_At.getTime()) / 1000);

            console.log('Remaining time:', remainingTime);
            if ( (Date.now() < ((game.end_At.getTime())-5*1000))) {
                console.log(`Remaining time for ending this game is ${remainingTime}`);
                return res.json({ responseCode: 200, responseMessage: 'Successfull' ,remainTime:remainingTime});
            }
            return res.json({ responseCode: 200, responseMessage: 'Successful' ,wait:"wait new game will start soon"});
            
        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({ responseCode: 500, responseMessage: 'Internal Server Error' });
        }
    },
    current: async (req, res) => {
      
        try {
            const result = await gameModel.aggregate([
                {
                    $group: {
                        _id: null, // Group by null to aggregate over all documents
                        totalRedBet: { $sum: "$red_bet" },
                        totalGreenBet: { $sum: "$green_bet" },
                    },
                },
            ]);

            //random color will generate................... here.....
            // console.log(result[0].totalGreenBet);
            let winnerColor = ""
            if (result[0].totalGreenBet == result[0].totalRedBet) {
                const dependcolor = (Math.random() * 10)
                console.log("check 2")
                if (dependcolor <= 5) {
                    winnerColor = "red"
                } else {
                    winnerColor = "green"
                }


            } else if (result[0].totalGreenBet > result[0].totalRedBet) {
                console.log("check 3")
                winnerColor = "red";
            }
            else {
                console.log("check 4")
                winnerColor = "greeen";
            }
            try {
                const updateColor = await gameModel.updateMany({}, { $set: { winner_color: winnerColor } }, { new: true });
                console.log("check 5");
            } catch (error) {
                console.error("Error updating documents:", error);
            }
            console.log("check 6")
            return res.json({
                responseCode: 200,
                responseMessage: "successfull",
                totalAmount: result,


            });
        } catch (error) {
            return res.json({
                responseCode: 500,
                responseMessage: "Internal Server Error",
            });
        }
    },

    bet: async (req, res) => {
        try {
            const user = await userWallet.findOne({ user_id: req.body.user_id });

            if (!user) {
                return res.json({
                    responseCode: 200,
                    responseMessage: "User does not exist",
                });
            }
            if (req.body.user_amount < 1) {
                return res.json({
                    responseCode: 200,
                    responseMessage: "Amount should be greater than 0",
                });
            }

            if (req.body.user_choice == "red") {
                req.body.red_bet = req.body.user_amount;
                req.body.green_bet = 0;
            } else if (req.body.user_choice == "green") {
                req.body.green_bet = req.body.user_amount;
                req.body.red_bet = 0;
            }
            console.log(req.body.green_bet, "and", req.body.red_bet);
            const current_Game_id = await which_Game_is_running.findOne({ game_Status: true }).sort({ created_At: -1 }).exec();
            req.body.game_id = current_Game_id._id;
            const status = await gameModel.create(req.body);

            console.log("check 1");
            if (!status) {
                return res.json({
                    responseCode: 400,
                    responseMessage: "Try another bet",
                });
            }
            await userWallet.findByIdAndUpdate(
                { _id: user._id },
                { $set: { wallet: user.wallet - req.body.user_amount } }
            );
            return res.json({
                responseCode: 200,
                responseMessage: "Bet successfully",
            });
        } catch (error) {
            return res.json({
                responseCode: 500,
                responseMessage: "Internal Server Error",
            });
        }
    },
};
