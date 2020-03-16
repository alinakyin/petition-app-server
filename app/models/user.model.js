const db = require('../../config/db');
var randtoken = require('rand-token');

//Return true if email is available
exports.emailAvailable = async function(email){
    const connection = await db.getPool().getConnection();
    const sql = "SELECT count(*) AS count FROM User WHERE email = " + "'" + email + "'";
    const [result, _] = await connection.query(sql);
    if (result[0].count === 0) {
        connection.release();
        return true
    }
};

//Inserts a new user
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
        const sql = "UPDATE User SET auth_token = ? WHERE user_id = " + id;
        await connection.query(sql, [token]);
        connection.release();
        return token;
    } catch {
        return -1;
    }
};

//Return true if token exists
exports.tokenExists = async function(token){
    const connection = await db.getPool().getConnection();
    const sql = "SELECT count(*) AS count FROM User WHERE auth_token = " + "'" + token + "'";
    const [result, _] = await connection.query(sql);
    if (result[0].count === 1) {
        connection.release();
        return true
    }
};

//Delete token from database
exports.deleteToken = async function(token){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "UPDATE User SET auth_token = NULL WHERE auth_token = " + "'" + token + "'";
        await connection.query(sql);
        connection.release();
    } catch {
        return -1;
    }
};

//Get some user details associated with the id
exports.getSomeDetails = async function(id){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "SELECT name, city, country, email FROM User WHERE user_id = " + id;
        const [row, _] = await connection.query(sql);
        connection.release();
        const name = row[0].name;
        const city = row[0].city;
        const country = row[0].country;
        const email = row[0].email;
        return [name, city, country, email];
    } catch {
        return -1;
    }
};

//Return token associated with the id
exports.getToken = async function(id){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "SELECT auth_token FROM User WHERE user_id = " + id;
        const [token, _] = await connection.query(sql);
        connection.release();
        return token[0].auth_token;
    } catch {
        return -1;
    }
};

//Get all user details associated with the id
exports.getDetails = async function(id){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "SELECT name, email, password, city, country FROM User WHERE user_id = " + id;
        const [row, _] = await connection.query(sql);
        connection.release();
        const name = row[0].name;
        const email = row[0].email;
        const password = row[0].password;
        const city = row[0].city;
        const country = row[0].country;
        return [name, email, password, city, country];
    } catch {
        return -1;
    }
};

//Insert token into database by id, return token
exports.updateName = async function(id, name){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "UPDATE User SET name = ? WHERE user_id = " + id;
        await connection.query(sql, [name]);
        connection.release();
    } catch {
        return -1;
    }
};

//Insert token into database by id, return token
exports.updateEmail = async function(id, email){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "UPDATE User SET email = ? WHERE user_id = " + id;
        await connection.query(sql, [email]);
        connection.release();
    } catch {
        return -1;
    }
};

//Insert token into database by id, return token
exports.updatePassword = async function(id, password){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "UPDATE User SET password = ? WHERE user_id = " + id;
        await connection.query(sql, [password]);
        connection.release();
    } catch {
        return -1;
    }
};

//Insert token into database by id, return token
exports.updateCity = async function(id, city){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "UPDATE User SET city = ? WHERE user_id = " + id;
        await connection.query(sql, [city]);
        connection.release();
    } catch {
        return -1;
    }
};

//Insert token into database by id, return token
exports.updateCountry = async function(id, country){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "UPDATE User SET country = ? WHERE user_id = " + id;
        await connection.query(sql, [country]);
        connection.release();
    } catch {
        return -1;
    }
};


