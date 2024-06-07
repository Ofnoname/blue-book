// model/User.js

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(process.env.DB_PATH || './database.sqlite');

db.run(`CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('normal', 'reviewer', 'admin')) NOT NULL DEFAULT 'normal',
    avatar_url TEXT
)`);

const createUser = (username, password, role, avatar_url, callback) => {
    const stmt = db.prepare(`INSERT INTO user (username, password, role, avatar_url) VALUES (?, ?, ?, ?)`);
    stmt.run(username, password, role, avatar_url, function (err) {
        callback(err, { id: this.lastID });
    });
    stmt.finalize();
};

const findUserByUsername = (username, callback) => {
    db.get(`SELECT * FROM user WHERE username = ?`, [username], (err, row) => {
        callback(err, row);
    });
};

const findUserById = (id, callback) => {
    db.get(`SELECT * FROM user WHERE id = ?`, [id], (err, row) => {
        callback(err, row);
    });
};

const updateUser = ({username, password, role, avatar_url}, callback) => {
    const stmt = db.prepare(`UPDATE user SET password = ?, role = ?, avatar_url = ? WHERE username = ?`);
    stmt.run(password, role, avatar_url, username, function (err) {
        callback(err);
    });
    stmt.finalize();
};

// const findAlluser = (options, callback) => {
//     const { page = 1, pageSize = 10 } = options;
//
//     let sql = `SELECT * FROM user`;
//
//     let countSql = `SELECT COUNT(*) AS total FROM user WHERE is_deleted = 0`;
//     let params = [];
//
//     // Append order and pagination only to the selection query
//     sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
//     params.push(pageSize);
//     params.push((page - 1) * pageSize);
//
//     // Execute the count query to get the total number of articles
//     db.get(countSql, params.slice(0, -2), (err, countResult) => {
//         if (err) {
//             callback(err, null);
//             return;
//         }
//
//         // Execute the query to get the paginated list of articles
//         db.all(sql, params, (err, rows) => {
//             if (err) {
//                 callback(err, null);
//                 return;
//             }
//             // Convert image_urls from JSON string to array
//             rows.forEach(row => {
//                 row.image_urls = JSON.parse(row.image_urls);
//             });
//             // Return both the total count and the paginated list of articles
//             callback(null, { total: countResult.total, articles: rows });
//         });
//     });
// };

module.exports = { createUser, findUserByUsername, updateUser, findUserById };
