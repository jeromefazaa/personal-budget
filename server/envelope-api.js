const express = require("express");
const {
    monthlyFinances,
    createEnvelope,
    setIncome,
    isValidEnvelope,
    addEnvelopeToDB,
    getEnvelopeById,
    getAllEnvelopes,
    updateEnvelope,
    deleteEnvelope
} = require("./db");


/* const envelopeObject = {
        id: id,
        concern: concern,
        budget: budget
    } */

const envelopeApiRouter = express.Router();


// :id param handler

envelopeApiRouter.param("id", (req, res, next, id) => {
    const idPassedIn = Number(id);
    const envelopeToAssign = getEnvelopeById(idPassedIn);
    if (envelopeToAssign) {
        req.envelope = envelopeToAssign;
        return next();
    }
    else {
        const err = new Error("Could not find envelope, invalid ID");
        err.status = 404;
        next(err);
    }
})

//put : api/envelope/income to update income, which is created by default and set to zero

envelopeApiRouter.put("/income", (req, res, next) => {
    const income = Number(req.body.income);
    const added = setIncome(income);
    if (added) {
        res.send(String(monthlyFinances.income));
    }
    else {
        const err = new Error("Could not update income make sure to send a valid number");
        err.status = 400;
        return next(err);
    }
});


//get monthly income 

envelopeApiRouter.get("/income", (req, res, next) => {
    res.send(String(monthlyFinances.income));
})

//post : create an envelope 
envelopeApiRouter.post("/", (req, res, next) => {
    const concern = String(req.body.concern);
    const budget = Number(req.body.budget);
    const envelopeToAdd = createEnvelope(concern, budget);
    const valid = isValidEnvelope(envelopeToAdd);
    if (!envelopeToAdd) {
        const err = new Error("Could not create envelope, make sure to send a valid concern and a budget");
        err.status = 400;
        return next(err);
    }
    if (valid) {
        addEnvelopeToDB(envelopeToAdd);
        res.status(201).send(envelopeToAdd);
    }
    else {
        const err = new Error(`Not enough money in your monthly finances to add the envelope, this is your income: ${monthlyFinances.income},and these are your total expenses ${monthlyFinances.totalExpenses()}`);
        err.status = 400;
        return next(err);
    }

});

//get: get all envelopes

envelopeApiRouter.get("/", (req, res, next) => {
    res.send(String(getAllEnvelopes()));
})

//get sepcific envelope
envelopeApiRouter.get("/:id", (req, res, next) => {
    res.send(req.envelope);
});


//update envelope

envelopeApiRouter.put("/:id", (req, res, next) => {
    const envelopeId = req.envelope.id;
    const updatedConcern = String(req.body.concern);
    const updatedBudget = Number(req.body.budget);
    const moneySpent = Number(req.body.spend);
    if (updatedConcern) {
        updateEnvelope(envelopeId, "concern", updatedConcern);
    }
    if (updatedBudget) {
        updateEnvelope(envelopeId, "budget", updatedBudget);
    }
    if (moneySpent) {
        updateEnvelope(envelopeId, "spend", moneySpent);
    }
    if(updatedConcern || updatedBudget || moneySpent){
        res.send(getEnvelopeById(envelopeId));
    }
    else{
        const err = new Error("Nothing was updated please provide either a new concern, a new budget, the money spent, or any of the three");
        err.status = 400;
        return next(err);
    }
});


//delete envelope

envelopeApiRouter.delete("/:id", (req,res,next) =>{
    const idToDelete = req.envelope.id;
    const deleted = deleteEnvelope(idToDelete);
    if (deleted){
        res.status(204).send(`Successfully deleted envelope with ID ${idToDelete}`);
    }
    else{
        const err = new Error("Could not delete envelope");
        err.status = 400;
        return next(err);
    }
})




module.exports = envelopeApiRouter;