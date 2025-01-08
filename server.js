const express = require("express");
const app = express();

const PORT = 3000;

app.get("/",(req,res,next)=>{
    res.send("<h1>Hello World</h1>");
});


app.listen(PORT,()=>{
    console.log(`Server is listening on port ${PORT}`);
    
})