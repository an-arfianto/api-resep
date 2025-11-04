import { createConnection } from "mysql";
require("dotenv").config();

// buat konfigurasi koneksi
const conn = createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true,
});

// koneksi database
conn.connect((err) => {
    if (err) throw err;
    console.log("DB Connected...");
});

export default conn;
