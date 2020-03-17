const db = require('../../config/db');

//View petitions
exports.getPetitions = async function(q, categoryId, authorId, sortBy) {
    try {
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
            sql += " ORDER BY signatureCount ASC, Petition.petition_id"; //in case of tiebreakers
        } else {
            sql += " ORDER BY signatureCount DESC, Petition.petition_id";
        }

        const [results, _] = await connection.query(sql);
        connection.release();
        return results;

    } catch {
        return -1;
    }
};


// //TODO post a petition > requires authentication
// exports.insert = async function(username){
//     let values = [username];
//     const connection = await db.getPool().getConnection();
//     const q = 'INSERT INTO lab2_users (username) VALUES ?';
//     const [result, _] = await connection.query(q, values);
//     console.log(`Inserted user with id ${result.insertId}`);
//     return result.insertId;
// };


//Retrieve detailed information about a petition
exports.getOne = async function(petitionId){
    try {
        const connection = await db.getPool().getConnection();

        const sql = "SELECT Petition.petition_id AS petitionId, title, Category.name AS category, User.name AS authorName, count(*) AS signatureCount, " +
            "description, User.user_id AS authorId, city AS authorCity, country AS authorCountry, created_date AS createdDate, closing_date AS closingDate " +
            "FROM Petition, Signature, Category, User " +
            "WHERE Petition.petition_id = Signature.petition_id AND Petition.category_id = Category.category_id AND Petition.author_id = User.user_id " +
            "AND Petition.petition_id = " + petitionId +
            " GROUP BY Petition.petition_id, title, Category.name, User.name";

        const [results, _] = await connection.query(sql);
        connection.release();
        return results;
    } catch {
        return -1;
    }
};


// //TODO patch a petition > requires authentication
// exports.alter = async function(newName, id){
//     const connection = await db.getPool().getConnection();
//     const q = 'UPDATE lab2_users SET username = ? WHERE user_id = ?';
//     const [result, _] = await connection.query(q, [newName, id]);
//     console.log(`Updated user with id ${result.insertId}`);
//     return result.insertId;
// };


// //TODO delete a petition > requires authentication
// exports.remove = async function(id){
//     const connection = await db.getPool().getConnection();
//     const q = 'DELETE FROM lab2_users WHERE user_id = ?';
//     await connection.query(q, [id]);
// };


//Retrieve all data about petition categories
exports.getCategories = async function(){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "SELECT * FROM Category";

        const [results, _] = await connection.query(sql);
        connection.release();
        return results;
    } catch {
        return -1;
    }
};


// //Retrieve a petition's hero image photo_filename
// exports.getPhoto = async function(petitionId){
//     try {
//         const connection = await db.getPool().getConnection();
//         const sql = "SELECT photo_filename FROM Petition where petition_id = " + petitionId;
//
//         const [results, _] = await connection.query(sql);
//         connection.release();
//         return results[0].photo_filename;
//     } catch {
//         return -1;
//     }
// };
//
//
// //TODO Set a petition's hero image
// exports.putPhoto = async function(petitionId){
//     try {
//         const connection = await db.getPool().getConnection();
//         const sql = "SELECT photo_filename FROM Petition where petition_id = " + petitionId;
//
//         const [results, _] = await connection.query(sql);
//         connection.release();
//         return results;
//     } catch {
//         return -1;
//     }
// };
//


//Retrieve author_id of a petition
exports.getAuthor = async function(petitionId){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "SELECT author_id FROM Petition where petition_id = " + petitionId;

        const [results, _] = await connection.query(sql);
        connection.release();
        return results[0].author_id;
    } catch {
        return -1;
    }
};


//Retrieve a petition's signatures
exports.getSignatures = async function(petitionId){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "SELECT signatory_id AS signatoryId, name, city, country, signed_date AS signedDate " +
            "FROM Petition, Signature, User WHERE Petition.petition_id = Signature.petition_id AND Signature.signatory_id = User.user_id AND " +
            "Petition.petition_id = " + petitionId + " ORDER BY signed_date ASC";

        const [results, _] = await connection.query(sql);
        connection.release();
        return results;
    } catch {
        return -1;
    }
};


//Checks that petition exists
exports.isValidPetitionId = async function(petitionId) {
    try {
        const connection = await db.getPool().getConnection();
        const sql = "SELECT count(*) AS count FROM Petition WHERE petition_id = " + petitionId;
        const [results, _] = await connection.query(sql);
        connection.release();
        if (results[0].count === 1) {
            return true
        }
    } catch {
        return -1;
    }
};