const db = require('../../config/db');

//View petitions
exports.getPetitions = async function(q, categoryId, authorId, sortBy, done) { //done is a function that gives the result in the controller
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

    await connection.query(sql, function (err, result) {
        if (err) {
            return done();
        } else {
            return done(result);
        }
    });
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
exports.getOne = async function(petitionId, done){
    const connection = await db.getPool().getConnection();

    const sql = "SELECT Petition.petition_id AS petitionId, title, Category.name AS category, User.name AS authorName, count(*) AS signatureCount, " +
        "description, User.user_id AS authorId, city AS authorCity, country AS authorCountry, created_date AS createdDate, closing_date AS closingDate " +
        "FROM Petition, Signature, Category, User " +
        "WHERE Petition.petition_id = Signature.petition_id AND Petition.category_id = Category.category_id AND Petition.author_id = User.user_id " +
        "AND Petition.petition_id = " + petitionId +
        " GROUP BY Petition.petition_id, title, Category.name, User.name";

    await connection.query(sql, function (err, result) {
        if (err) {
            // console.log(err);
            connection.release();
            return done();
        } else if (result.length === 0) {
            connection.release();
            return done("Not found");
        } else {
            connection.release();
            return done(result);
        }
    });
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
exports.getCategories = async function(done){
    const connection = await db.getPool().getConnection();
    const sql = "SELECT * FROM Category";

    await connection.query(sql, function(err, result) {
        if (err) {
            connection.release();
            return done();
        } else {
            connection.release();
            return done(result);
        }
    });
};


//Retrieve a petition's hero image
exports.getPhoto = async function(petitionId, done){
    const connection = await db.getPool().getConnection();
    const sql = "SELECT photo_filename FROM Petition where petition_id = " + petitionId;

    await connection.query(sql, function(err, result) {
        if (err) {
            connection.release();
            return done();
        } else if (result.length === 0) {
            connection.release();
            return done("Not found");
        } else {
            connection.release();
            return done(result);
        }
    });
};


//Retrieve a petition's signatures
exports.getSignatures = async function(petitionId, done){
    const connection = await db.getPool().getConnection();
    const sql = "SELECT signatory_id AS signatoryId, name, city, country, signed_date AS signedDate " +
        "FROM Petition, Signature, User WHERE Petition.petition_id = Signature.petition_id AND Signature.signatory_id = User.user_id AND " +
        "Petition.petition_id = " + petitionId + " ORDER BY signed_date ASC";

    await connection.query(sql, function(err, result) {
        if (err) {
            connection.release();
            return done();
        } else {
            connection.release();
            return done(result);
        }
    });
};

//Checks that petition exists
exports.isValidPetitionId = async function(petitionId, done) {
    const connection = await db.getPool().getConnection();
    const sql = "SELECT * FROM Petition WHERE petition_id = " + petitionId;
    await connection.query(sql, function(err, result) {
        if (err || result.length !== 1) {
            connection.release();
            return done();
        } else {
            connection.release();
            return done(true)
        }
    });
};