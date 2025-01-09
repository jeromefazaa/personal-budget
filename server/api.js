const express = require("express");


//creating an api router to send all /api here
const apiRouter = express.Router();


//routing all /api/envelope here
const envelopeApiRouter = require("./envelope-api.js");
apiRouter.use("/envelope", envelopeApiRouter);



module.exports = apiRouter;