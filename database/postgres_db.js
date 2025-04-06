
const  Pool  = require('pg').Pool;
const pool = new Pool({
    user: "jeromefazaa",
    host: "localhost",
    port: 5432,
    database: "Envelope"
});



module.exports = pool;