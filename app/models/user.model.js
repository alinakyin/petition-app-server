const db = require('../../config/db');
var randtoken = require('rand-token');

exports.emailAvailable = async function(email){
    const connection = await db.getPool().getConnection();
    const sql = "SELECT count(*) AS count FROM User WHERE email = " + "'" + email + "'";
    const [result, _] = await connection.query(sql);
    if (result[0].count === 0) {
        connection.release();
        return true
    }
};

exports.emailAvailable = async function(email){
    const connection = await db.getPool().getConnection();
    const sql = "SELECT count(*) AS count FROM User WHERE email = " + "'" + email + "'";
    const [result, _] = await connection.query(sql);
    if (result[0].count === 0) {
        connection.release();
        return true
    }
};

exports.insert = async function(user_details){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "INSERT INTO User (name, email, password, city, country) VALUES (?,?,?,?,?)";
        let [result, _] = await connection.query(sql, user_details);
        connection.release();
        return result.insertId;
    } catch {
        return -1;
    }

};

//Return id associated with the email
exports.getUserByEmail = async function(email){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "SELECT user_id FROM User WHERE email = " + "'" + email + "'";
        const [id, _] = await connection.query(sql);
        connection.release();
        return id[0].user_id;
    } catch {
        return -1;
    }

};

//Insert token into database by id, return token
exports.insertToken = async function(id){
    try {
        const connection = await db.getPool().getConnection();
        var token = randtoken.generate(32);
        const sql = "UPDATE User SET auth_token = ? WHERE user_id = " + "'" + id + "'";
        await connection.query(sql, [token]);
        connection.release();
        return token;
    } catch(err) {
        return -1;
    }
};

/*
exports.getOne = async function(userId){
    const connection = await db.getPool().getConnection();
    const q = 'SELECT * FROM lab2_users WHERE user_id = ?';
    const [rows, _] = await connection.query(q, [userId]);
    return rows;
};

exports.alter = async function(newName, id){
    const connection = await db.getPool().getConnection();
    const q = 'UPDATE lab2_users SET username = ? WHERE user_id = ?';
    const [result, _] = await connection.query(q, [newName, id]);
    console.log(`Updated user with id ${result.insertId}`);
    return result.insertId;
};

exports.remove = async function(id){
    const connection = await db.getPool().getConnection();
    const q = 'DELETE FROM lab2_users WHERE user_id = ?';
    const [result, _] = await connection.query(q, [id]);
    console.log(`Deleted user with id ${id}`);
    return result.insertId;
};

 */