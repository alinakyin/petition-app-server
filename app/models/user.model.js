const db = require('../../config/db');
const randtoken = require('rand-token');

//Return true if email is available
exports.emailAvailable = async function(email){
    const connection = await db.getPool().getConnection();
    const sql = "SELECT count(*) AS count FROM User WHERE email = " + "'" + email + "'";
    const [result, _] = await connection.query(sql);
    connection.release();
    if (result[0].count === 0) {
        return true;
    }
};


//Insert a new user
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


//Return hashed password associated with the id
exports.getPassword = async function(id){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "SELECT password FROM User WHERE user_id = " + id;
        const [row, _] = await connection.query(sql);
        connection.release();
        return row[0].password;
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
    connection.release();
    if (result[0].count === 1) {
        return true;
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


//Return id associated with the token
exports.getId = async function(token){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "SELECT user_id FROM User WHERE auth_token = " + "'" + token + "'";
        const [user, _] = await connection.query(sql);
        connection.release();
        return user[0].user_id;
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


//Update name
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


//Update email
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


//Update password
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


//Update city
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


//Update country
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


//Check if a user has signed a petition
exports.hasSigned = async function(userId, petitionId) {
    try {
        const connection = await db.getPool().getConnection();
        const sql = "SELECT count(*) AS count FROM Signature WHERE signatory_id = " + userId + " AND petition_id = " + petitionId;
        const [results, _] = await connection.query(sql);
        connection.release();
        if (results[0].count === 1) {
            return true;
        }
    } catch {
        return -1;
    }
};


//Check that user exists
exports.isValidUserId = async function(id) {
    try {
        const connection = await db.getPool().getConnection();
        const sql = "SELECT count(*) AS count FROM User WHERE user_id = " + id;
        const [results, _] = await connection.query(sql);
        connection.release();
        if (results[0].count === 1) {
            return true;
        }
    } catch {
        return -1;
    }
};


//Retrieve a user's photo_filename
exports.getPhoto = async function(id){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "SELECT photo_filename FROM User WHERE user_id = " + id;

        const [results, _] = await connection.query(sql);
        connection.release();
        return results[0].photo_filename;
    } catch {
        return -1;
    }
};


//Update a users's photo_filename
exports.putPhoto = async function(id, filename){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "UPDATE User SET photo_filename = ? WHERE user_id = " + id;

        await connection.query(sql, [filename]);
        connection.release();
    } catch {
        return -1;
    }
};


//Delete photo_filename from database
exports.deletePhoto = async function(id){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "UPDATE User SET photo_filename = NULL WHERE user_id = " + id;
        await connection.query(sql);
        connection.release();
    } catch {
        return -1;
    }
};