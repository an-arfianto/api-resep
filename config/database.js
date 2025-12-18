import mysql from "mysql";
import dotenv from "dotenv";
dotenv.config();

// buat konfigurasi koneksi
const conn = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true,
    waitForConnections: true, // wait for available connection if all are busy
    connectionLimit: 10, // max 10 concurrent connections
    queueLimit: 0, // unlimited queue
});

function db(query, params = []) {
    return new Promise((resolve, reject) => {
        conn.query(query, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

export default db;
