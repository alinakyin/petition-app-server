const db = require('../../config/db');

exports.emailInUse = async function(email){
    const connection = await db.getPool().getConnection();
    const sql = "SELECT * FROM User WHERE email = " + email;
    const [rows, _] = await connection.query(sql);
    console.log(rows);
    return rows.length > 0;
};

exports.insert = async function(user_details){
    const connection = await db.getPool().getConnection();
    const sql = "INSERT INTO User (name, email, password, city, country) VALUES (?,?,?,?,?)";
    const [rows, _] = await connection.query(sql, user_details);
    console.log(`Inserted user with id ${rows.insertId}`);
    return rows.insertId;
};


exports.getAll = async function(){
    const connection = await db.getPool().getConnection();
    const q = 'SELECT * FROM lab2_users';
    const [rows, fields] = await connection.query(q);
    return rows;
};

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