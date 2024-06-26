const gameRoute=require('express').Router();
const gameController=require('../controller/gamecontroller');
gameRoute.get('/timer',gameController.timer);
gameRoute.get('/game',gameController.current);
gameRoute.post('/bet',gameController.bet);

module.exports=gameRoute;