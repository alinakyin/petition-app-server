const db = require('../../config/db');

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

exports.insert = async function(username){
    let values = [username];
    const connection = await db.getPool().getConnection();
    const q = 'INSERT INTO lab2_users (username) VALUES ?';
    const [result, _] = await connection.query(q, values);
    console.log(`Inserted user with id ${result.insertId}`);
    return result.insertId;
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