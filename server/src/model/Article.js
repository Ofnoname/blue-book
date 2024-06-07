const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(process.env.DB_PATH || './database.sqlite');

const {findUserById} = require('./User');

// 创建文章表
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

const createArticle = ({userId, title, content, imageUrls=[], location, status='pending'}, callback) => {
    const stmt = db.prepare(`INSERT INTO article (user_id, title, content, image_urls, location, status) VALUES (?, ?, ?, ?, ?, ?)`);
    stmt.run(userId, title, content, JSON.stringify(imageUrls), location, status, function (err) {
        console.log(err);
        callback(err, { id: this.lastID });
    });
    stmt.finalize();
};

const findArticles = (options, callback) => {
    const { page = 1, pageSize = 10, status, userId, keyword } = options;
    let sql = `SELECT * FROM article WHERE is_deleted = 0`;
    let countSql = `SELECT COUNT(*) AS total FROM article WHERE is_deleted = 0`;
    let params = [];

    if (status) {
        sql += ` AND status = ?`;
        countSql += ` AND status = ?`;
        params.push(status);
    }

    if (userId) {
        sql += ` AND user_id = ?`;
        countSql += ` AND user_id = ?`;
        params.push(userId);
    }

    if (keyword) {
        sql += ` AND (title LIKE ? OR content LIKE ?)`;
        countSql += ` AND (title LIKE ? OR content LIKE ?)`;
        params.push(`%${keyword}%`, `%${keyword}%`);
    }

    // Append order and pagination only to the selection query
    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    let countParams = params.slice();
    params.push(pageSize, (page - 1) * pageSize);

    db.get(countSql, countParams, (err, countResult) => {
        if (err) {
            callback(err, null);
            return;
        }

        // Execute the query to get the paginated list of articles
        db.all(sql, params, (err, rows) => {
            if (err) {
                callback(err, null);
                return;
            }
            rows.forEach(row => {
                row.image_urls = JSON.parse(row.image_urls);
            });
            // Append the username and avatar_url of the user who created the article (with Promise)
            Promise.all(rows.map(row => {
                return new Promise((resolve, reject) => {
                    findUserById(row.user_id, (err, user) => {
                        if (err) {
                            reject(err);
                        } else {
                            row.user = user;
                            resolve();
                        }
                    });
                });
            })).then(() => {
                // Return both the total count and the paginated list of articles
                callback(null, { total: countResult.total, articles: rows });
            }).catch(err => {
                callback(err, null);
            });
        });
    });
};


const findArticleById = (articleId, callback) => {
    db.get(`SELECT * FROM article WHERE id = ?`, articleId, (err, row) => {
        if (row) {
            row.image_urls = JSON.parse(row.image_urls);

            // Append the username and avatar_url of the user who created the article
            findUserById(row.user_id, (err, user) => {
                if (err) {
                    callback(err, null);
                    return;
                }
                row.user = user;
                callback(err, row);
            })
        }
        else callback(err, row);
    });
}

const updateArticle = ({ articleId, title, content, imageUrls, location, status, rejectReason }, callback) => {
    let sql = 'UPDATE article SET ';
    let params = [];
    let sqlSetParts = [];

    if (title !== undefined) {
        sqlSetParts.push('title = ?');
        params.push(title);
    }
    if (content !== undefined) {
        sqlSetParts.push('content = ?');
        params.push(content);
    }
    if (imageUrls !== undefined) {
        sqlSetParts.push('image_urls = ?');
        params.push(JSON.stringify(imageUrls));
    }
    if (location !== undefined) {
        sqlSetParts.push('location = ?');
        params.push(location);
    }
    if (status !== undefined) {
        sqlSetParts.push('status = ?');
        params.push(status);
    }
    if (rejectReason !== undefined) {
        sqlSetParts.push('rejected_reason = ?');
        params.push(rejectReason);
    }

    // 如果没有提供任何可更新的字段，则直接返回错误
    if (sqlSetParts.length === 0) {
        return callback(new Error('No fields provided for update'));
    }

    sql += sqlSetParts.join(', ') + ' WHERE id = ?';
    params.push(articleId);

    const stmt = db.prepare(sql);
    stmt.run(params, function (err) {
        callback(err);
    });
    stmt.finalize();
};


const deleteArticle = (articleId, callback) => {
    const stmt = db.prepare(`UPDATE article SET is_deleted = 1 WHERE id = ?`);
    stmt.run(articleId, function (err) {
        callback(err);
    });
    stmt.finalize();
};

// 彻底删除文章
const trueDeleteArticle = (articleId, callback) => {
    const stmt = db.prepare(`DELETE FROM article WHERE id = ?`);
    stmt.run(articleId, function (err) {
        callback(err);
    });
    stmt.finalize();
};

module.exports = { createArticle, updateArticle, deleteArticle, trueDeleteArticle, findArticles, findArticleById};
