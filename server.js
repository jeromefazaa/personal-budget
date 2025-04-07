const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require('cors');

const PORT = process.env.PORT || 3000;

//allowing for cors
app.use(cors());

//parsing the body into req.body
app.use(bodyParser.json());

app.use(express.static('public'));


//mounting envelope router to send all /envelope here
const envelopeRouter = require('./server/envelope');
app.use("/envelope", envelopeRouter);


//mounting user router to send all /user here
const userRouter = require('./server/user');
app.use("/user", userRouter);



//error handler
app.use((err,req,res,next) => {
    console.log(err.message);
    res.status(err.status || 500).send(err.message);
})



app.listen(PORT,()=>{
    console.log(`Server is listening on port ${PORT}`);
    
})