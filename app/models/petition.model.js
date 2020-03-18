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


//Insert a new petition
exports.insert = async function(petition_details){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "INSERT INTO Petition (title, description, author_id, category_id, created_date, closing_date) VALUES (?,?,?,?,?,?)";
        let [result, _] = await connection.query(sql, petition_details);
        connection.release();
        return result.insertId;
    } catch {
        return -1;
    }
};


//Check that a category exists
exports.categoryExists = async function(categoryId) {
    try {
        const connection = await db.getPool().getConnection();
        const sql = "SELECT count(*) AS count FROM Category WHERE category_id = " + categoryId;
        const [results, _] = await connection.query(sql);
        connection.release();
        if (results[0].count === 1) {
            return true;
        }
    } catch {
        return -1;
    }
};


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
        const title = results[0].title;
        const category = results[0].category;
        const authorName = results[0].authorName;
        const signatureCount = results[0].signatureCount;
        const description = results[0].description;
        const authorId = results[0].authorId;
        const authorCity = results[0].authorCity;
        const authorCountry = results[0].authorCountry;
        const createdDate = results[0].createdDate;
        const closingDate = results[0].closingDate;
        return [petitionId, title, category, authorName, signatureCount, description, authorId, authorCity, authorCountry, createdDate, closingDate];

    } catch {
        return -1;
    }
};


//Get all petition details associated with the id
exports.getDetails = async function(id){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "SELECT title, description, category_id, closing_date FROM Petition WHERE petition_id = " + id;
        const [row, _] = await connection.query(sql);
        connection.release();
        const title = row[0].title;
        const description = row[0].description;
        const categoryId = row[0].category_id;
        const closingDate = row[0].closing_date;
        return [title, description, categoryId, closingDate];
    } catch {
        return -1;
    }
};


//Update title
exports.updateTitle = async function(id, title){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "UPDATE Petition SET title = ? WHERE petition_id = " + id;
        await connection.query(sql, [title]);
        connection.release();
    } catch {
        return -1;
    }
};


//Update description
exports.updateDescription = async function(id, description){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "UPDATE Petition SET description = ? WHERE petition_id = " + id;
        await connection.query(sql, [description]);
        connection.release();
    } catch {
        return -1;
    }
};


//Update categoryId
exports.updateCategoryId = async function(id, categoryId){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "UPDATE Petition SET category_id = ? WHERE petition_id = " + id;
        await connection.query(sql, [categoryId]);
        connection.release();
    } catch {
        return -1;
    }
};


//Update closingDate
exports.updateClosingDate = async function(id, closingDate){
    try {
        const connection = await db.getPool().getConnection();
        if (closingDate == null) {
            let sql = "UPDATE Petition SET closing_date = NULL WHERE petition_id = " + id;
            await connection.query(sql);
            connection.release();
        } else {
            let sql = "UPDATE Petition SET closing_date = ? WHERE petition_id = " + id;
            await connection.query(sql, [closingDate]);
            connection.release();
        }

    } catch {
        return -1;
    }
};


//Delete a petition
exports.remove = async function(id){
    try {
        const connection = await db.getPool().getConnection();
        const sql = 'DELETE FROM Petition WHERE petition_id = ?';
        await connection.query(sql, [id]);
        connection.release();
    } catch {
        return -1;
    }
};


//Delete all of a petition's signatures
exports.removeAll = async function(id){
    try {
        const connection = await db.getPool().getConnection();
        const sql = 'DELETE FROM Signature WHERE petition_id = ?';
        await connection.query(sql, [id]);
        connection.release();
    } catch {
        return -1;
    }
};


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


//Check if a petition has closed
exports.hasClosed = async function(petitionId, currentDate) {
    try {
        const connection = await db.getPool().getConnection();
        const sql = "SELECT closing_date FROM Petition WHERE petition_id = " + petitionId;
        const [results, _] = await connection.query(sql);
        connection.release();
        if (results[0].closing_date < currentDate) {
            return true;
        }
    } catch {
        return -1;
    }
};


//Insert a new petition
exports.addSignature = async function(signature_details){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "INSERT INTO Signature (signatory_id, petition_id, signed_date) VALUES (?,?,?)";
        await connection.query(sql, signature_details);
        connection.release();

    } catch {
        return -1;
    }
};


//Delete one signature from a petition
exports.removeOne = async function(userId, petitionId){
    try {
        const connection = await db.getPool().getConnection();
        const sql = 'DELETE FROM Signature WHERE signatory_id = ? AND petition_id = ?';
        await connection.query(sql, [userId, petitionId]);
        connection.release();
    } catch {
        return -1;
    }
};


//Check that petition exists
exports.isValidPetitionId = async function(petitionId) {
    try {
        const connection = await db.getPool().getConnection();
        const sql = "SELECT count(*) AS count FROM Petition WHERE petition_id = " + petitionId;
        const [results, _] = await connection.query(sql);
        connection.release();
        if (results[0].count === 1) {
            return true;
        }
    } catch {
        return -1;
    }
};


//Retrieve a petition's hero image photo_filename
exports.getPhoto = async function(petitionId){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "SELECT photo_filename FROM Petition where petition_id = " + petitionId;

        const [results, _] = await connection.query(sql);
        connection.release();
        return results[0].photo_filename;
    } catch {
        return -1;
    }
};


//TODO Set a petition's hero image
exports.putPhoto = async function(petitionId){
    try {
        const connection = await db.getPool().getConnection();
        const sql = "SELECT photo_filename FROM Petition where petition_id = " + petitionId;

        const [results, _] = await connection.query(sql);
        connection.release();
        return results;
    } catch {
        return -1;
    }
};
