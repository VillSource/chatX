const mysql = require('mysql2')

const pool = mysql.createPool({
    user: 'network-chatX',
    host: process.env.DATABASE_HOST,
    password: 'password',
    database: 'network-chatX'
});


module.exports = {
    pool,
}
