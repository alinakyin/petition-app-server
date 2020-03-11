const db = require('../../config/db');
// view petitions sorted by the number of signatures descending (highest to lowest)

exports.getPetitions = async function(q, categoryId, authorId, sortBy){
    const connection = await db.getPool().getConnection();

    var sql = "SELECT Petition.petition_id AS petitionId, title, Category.name AS category, User.name AS authorName, count(*) AS signatureCount " +
        "FROM Petition, Signature, Category, User " +
        "WHERE Petition.petition_id = Signature.petition_id AND Petition.category_id = Category.category_id AND Petition.author_id = User.user_id";

    if (q != null) {
        sql += " AND title LIKE '%" + q + "%'";
    }

    if (categoryId != null) {
        sql += " AND Petition.category_id = " + categoryId;
    }

    if (authorId != null) {
        sql += " AND author_id = " + authorId;
    }

    sql += " GROUP BY Petition.petition_id, title, Category.name, User.name";

    //ALPHABETICAL_ASC, ALPHABETICAL_DESC, SIGNATURES_ASC, OR SIGNATURES_DESC

    if (sortBy == "ALPHABETICAL_ASC") {
        sql += " ORDER BY title ASC";
    } else if (sortBy == "ALPHABETICAL_DESC") {
        sql += " ORDER BY title DESC";
    } else if (sortBy == "SIGNATURES_ASC") {
        sql += " ORDER BY signatureCount ASC";
    } else {
        sql += " ORDER BY signatureCount DESC";
    }

    const [rows, fields] = await connection.query(sql);

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
    await connection.query(q, [id]);
};