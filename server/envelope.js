const express = require('express');
const envelopeRouter = express.Router();
const pool = require('../database/postgres_db');


async function getEnvDataById(id) {
    const query = 'SELECT name,budget,envelope_id FROM envelopes WHERE envelope_id = $1 ';
    const values = [id];
    const dbRes = await pool.query(query, values);
    return dbRes.rows[0];
}

//create new envelope 
envelopeRouter.post('/', async (req, res, next) => {
    try {
        const user_id = req.body.user_id;
        const name = req.body.name;
        const budget = req.body.budget;
        const query = 'INSERT INTO envelopes (user_id,name,budget) VALUES ($1,$2,$3) RETURNING envelope_id';
        const values = [user_id, name, budget];
        const dbRes = await pool.query(query, values);
        const env_id = dbRes.rows[0].envelope_id;
        const data = await getEnvDataById(env_id);
        res.status(200).send(data);

    } catch (error) {

        next(error);
    }
})

//get envlope by id 
envelopeRouter.get('/:id', async (req, res, next) => {
    try {
        const env_id = req.params.id;
        const data = await getEnvDataById(env_id);
        res.status(200).send(data);
    } catch (error) {
        next(error);

    }
})


//delete envelope by id
envelopeRouter.delete('/:id', async (req, res, next) => {
    try {
        const envelope_id = req.params.id;
        await pool.query('DELETE FROM envelopes WHERE envelope_id = $1', [envelope_id]);
        res.sendStatus(200);
    } catch (error) {
        next(error);
    }


});

//update envelope by id query params:?name=name&budget=budget
envelopeRouter.put('/:id', async (req, res, next) => {
    try {
        const name = req.query.name;
        const budget = req.query.budget;
        const id = req.params.id;
        const dbres = await pool.query('UPDATE envelopes SET name = $1,budget = $2 WHERE envelope_id = $3 RETURNING name,budget,envelope_id', [name, budget, id]);
        res.status(200).send(dbres.rows[0]);
    } catch (error) {
        next(error);


    }

})

//get all envelopes by userid

envelopeRouter.get('/user/:id', async (req, res, next) => {
    try {
        const user_id = req.params.id;
        const dbres = await pool.query('SELECT name,budget,envelope_id FROM envelopes WHERE user_id = $1', [user_id]);
        res.status(200).send(dbres.rows);
       
    } catch (error) {
        next(error)
    }

});


module.exports = envelopeRouter;

/*
        console.log("making query");
        console.log("awaiting query");
        console.log("query received");        
        console.log("sending response");





*/