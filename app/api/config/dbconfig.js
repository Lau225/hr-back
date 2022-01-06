//  db.js 
const mysql = require("mysql");
let pool = mysql.createPool({
    host: "localhost",
    port: 3306,
    database: "hr3",
    user: "root",
    password: "root",
});
function query(sql, callback) {
    pool.getConnection((err, connection) => {
        connection.query(sql, (err, rows) => {
            callback(err, rows);
            connection.release();
        });
    });
}
exports.query = query;