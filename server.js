const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const PORT = 3000;

//parsing the body into req.body
app.use(bodyParser.json());


app.get("/",(req,res,next)=>{
    res.send("Hello World");
});


//mounting api router to send all /api here
const apiRouter = require("./server/api.js");
app.use("/api", apiRouter);


//error handler
app.use((err,req,res,next) => {
    console.log(err.message);
    res.status(err.status || 500).send(err.message);
})



app.listen(PORT,()=>{
    console.log(`Server is listening on port ${PORT}`);
    
})