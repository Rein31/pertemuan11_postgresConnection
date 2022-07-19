const Pool = require('pg').Pool

const pool = new Pool({
    user:"postgres",
    password:"ayamgoreng",
    database:"db_contacts",
    host:"localhost",
    port:5432
})

module.exports = pool