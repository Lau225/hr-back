// for.js
const db = require("../config/dbconfig");
async function packet(sql) {
    const res = await new Promise((resolve, reject) => {
        return db.query(sql, (err, data) => {
          resolve(data);
          console.log(err);
        });
    });
    return res;
}

exports.packet = packet;