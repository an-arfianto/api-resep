import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});

async function query(sql, params) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error(" Database query eror: ", error);
        throw error;
    }
}

// test
pool.getConnection()
    .then((connection) => {
        console.log(" Koneksi database sukses");
        connection.release();
    })
    .catch((err) => {
        console.error(" Koneksi database gagal: ", err.message);
    });

export default query;
