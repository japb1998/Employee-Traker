require('dotenv').config();
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.USER_DB,
    port: process.env.PORT_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.NAME_DB
});



connection.connect((err) => {
    if (err) throw err;
    console.log('Live')
});



module.exports = connection