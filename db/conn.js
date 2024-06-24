const mongoose=require('mongoose');
const uri="mongodb://localhost:27017/moduleTest_1";

const conn=mongoose.connect(uri);
conn.then((result) => {
    console.log("connection successfully...............");
    
}).catch((err) => {
    console.log("connection failed.....");
});
module.exports=conn;