const express = require('express');
const userRouter = express.Router();
const pool = require('../database/postgres_db');

/*every session, a default/inactive user is cretaed to temporarly store the data, when a user signs up that inactive user is made active 
 and the default values are updated */


//create new user, all new users created will have default values
userRouter.get('/', async (req, res, next) => {
    try {
        const query = 'INSERT INTO users DEFAULT VALUES RETURNING user_id;';
        const dbRes = await pool.query(query);
        const user_id = dbRes.rows[0].user_id;
        res.status(200).send({ user_id: user_id });
    } catch (error) {
        next(error);
    }

});


//update user monthly income
userRouter.put('/income', async (req, res, next) => {
    try {
        const newIncome = req.body.income;
        const user_id = req.body.user_id;
        const query = 'UPDATE users SET user_monthly_income = $1 WHERE user_id = $2;';
        const values = [newIncome, user_id];
        const dbRes = await pool.query(query, values);
        res.status(200).json('Success!');

    } catch (error) {
        next(error);
    }
});


//get expenseds by id 
userRouter.get('/:id/expenses', async (req, res, next) => {
    try {
        const user_id = req.params.id;
        const query = 'SELECT user_total_expenses FROM users WHERE user_id = $1';
        const values = [user_id];
        const dbres = await pool.query(query, values);
        const total_expenses = dbres.rows[0].user_total_expenses;
        res.status(200).send({ total_expenses: total_expenses });
    } catch (error) {
        next(error);
    }

})
//get user income by id
userRouter.get('/:id/income', async (req, res, next) => {
    try {
        const user_id = req.params.id;
        const query = `SELECT user_monthly_income FROM users WHERE user_id = $1`;
        const values = [user_id];
        const dbres = await pool.query(query, values);
        const income = dbres.rows[0].user_monthly_income;
        res.status(200).send({ income: income });
    } catch (error) {
        next(error)
    }
})

//update user first name, last name, email and password, signing up the user
userRouter.put('/', async (req, res, next) => {
    try {
        const first = req.body.first;
        const last = req.body.last;
        const email = req.body.email;

        if (!email.match(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )) throw new Error('Invalid Email Adrress!');

        const pass = req.body.pass;
        if (!(typeof Number(pass) === 'number' && !isNaN(Number(pass)))) throw new Error('Invalid Password');
        const id = req.body.id;
        const dbres = await pool.query('UPDATE users SET user_first_name = $1,user_last_name=$2,user_email=$3,user_password=$4,is_active=true WHERE user_id=$5 RETURNING user_first_name,user_last_name,user_email,user_password,user_id', [first, last, email, pass, id]);
        res.status(200).send(dbres.rows[0]);
    } catch (error) {
        next(error)
    }
});

//get all user info (first,last,email,pass) by id
userRouter.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const dbres = await pool.query('SELECT user_first_name,user_last_name,user_email,user_password,user_id FROM users WHERE user_id = $1',[id]);
        res.status(200).send(dbres.rows[0]);
    } catch (error) {
        next(error)
    }
})

//login by email and pass
userRouter.post('/login', async (req,res,next) =>{
    try {
        const email = req.body.email;
        const pass = req.body.pass;
        console.log(email);
        console.log(pass);
        let dbres;
        try {
            dbres = await pool.query('SELECT user_email,user_password,user_id FROM users WHERE user_email = $1',[email]);
        } catch (error) {
            console.log('query error');
            console.log(error.message);
            res.status(400).send({message:"Email does not exist, please enter a correct email, or create an account first"});
        }
        if(dbres.rows[0].user_password === pass){
            res.status(200).send(dbres.rows[0]);
        }else{
            res.status(400).send({message:"Wrong Password!"});
        }

    } catch (error) {
        next(error)
    }
})


module.exports = userRouter;

/*
        console.log("making query");
        console.log("awaiting query");
        console.log("query received");        
        console.log("sending response");





*/