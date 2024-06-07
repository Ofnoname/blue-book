const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});


const dataPath = path.join(__dirname, 'data.json');
const rawData = fs.readFileSync(dataPath);
const { users, articles } = JSON.parse(rawData);

// 清除原有数据，并创建数据库
db.serialize(() => {
    db.run(`DROP TABLE IF EXISTS user`);
    db.run(`DROP TABLE IF EXISTS article`);

    db.run(`CREATE TABLE IF NOT EXISTS article (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    content TEXT,
    image_urls TEXT,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT 0,
    status TEXT CHECK(status IN ('approved', 'rejected', 'pending')) NOT NULL DEFAULT 'pending',
    rejected_reason TEXT,
    FOREIGN KEY (user_id) REFERENCES user(id)
)`);

    db.run(`CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('normal', 'reviewer', 'admin')) NOT NULL DEFAULT 'normal',
    avatar_url TEXT
)`);
});


const insertUsers = () => {
    const userInsert = db.prepare(`INSERT INTO user (username, password, role, avatar_url) VALUES (?, ?, ?, ?)`);
    users.forEach(user => {
        const hashedPassword = bcrypt.hashSync(user.password, 8); // 假设我们存储的是加密后的密码
        userInsert.run(user.username, hashedPassword, user.role, user.avatar_url);
    });
    userInsert.finalize();
};


const insertArticles = () => {
    const articleInsert = db.prepare(`INSERT INTO article (user_id, title, content, image_urls, location, status) VALUES (?, ?, ?, ?, ?, ?)`);
    articles.forEach(article => {
        articleInsert.run(article.userId, article.title, article.content, JSON.stringify(article.image_urls), article.location, article.status);
    });
    articleInsert.finalize();
};


db.serialize(() => {
    insertUsers();
    insertArticles();
});


db.close((err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Close the database connection.');
});
