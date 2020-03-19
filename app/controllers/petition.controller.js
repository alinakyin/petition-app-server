const Petition = require('../models/petition.model');
const User = require('../models/user.model');
const fs = require('fs');
const photoDirectory = './storage/photos/';

//View petitions
exports.list = async function(req, res){
    try {
        let q = req.query.q;
        let categoryId = req.query.categoryId;
        let authorId = req.query.authorId;
        let sortBy = req.query.sortBy;
        let startIndex = +req.query.startIndex;
        let count = +req.query.count;
        const results = await Petition.getPetitions(q, categoryId, authorId, sortBy);
        if (results === -1) {
            return res.sendStatus(500);
        } else {
            if (!(isNaN(startIndex)) && !(isNaN(count))) { //checking if they exist
                return res.status(200)
                    .send(results.slice(startIndex, startIndex + count));
            } else if (!(isNaN(startIndex))) { //if only the startIndex exists
                return res.status(200)
                    .send(results.slice(startIndex))
            } else {
                return res.status(200)
                    .send(results);
            }
        }

    } catch (err) {
        return res.sendStatus(500);
    }
};


//Add a new petition
exports.add = async function(req, res){
    try {
        let currToken = req.get('X-Authorization');
        const exists = await User.tokenExists(currToken);
        if (!(exists) || currToken === undefined) {
            return res.sendStatus(401);
        } else {
            let petition_data = {
                "title": req.body.title,
                "description": req.body.description,
                "categoryId": req.body.categoryId,
                "closingDate": req.body.closingDate
            };

            let title = petition_data['title'].toString();
            let description = petition_data['description'].toString();
            let categoryId = petition_data['categoryId'];
            let closingDate = petition_data['closingDate'].toString();

            const categoryExists = await Petition.categoryExists(categoryId);
            let currDateTime = new Date();

            if (!(categoryExists) || (closingDate < currDateTime)) {
                return res.sendStatus(400);
            } else {
                const authorId = await User.getId(currToken);
                let petition_details = [title, description, authorId, categoryId, currDateTime, closingDate];
                let insertId = await Petition.insert(petition_details);
                if (insertId === -1) {
                    return res.sendStatus(400);
                } else {
                    return res.status(201)
                        .send({petitionId: insertId});
                }
            }
        }

    } catch (err) {
        return res.sendStatus(400);
    }
};


//Retrieve detailed information about a petition
exports.listInfo = async function(req, res) {
    try {
        let id = +req.params.id;
        const isValidId = await Petition.isValidPetitionId(id);

        if (!(isValidId)) {
            return res.sendStatus(404);
        } else {
            const [petitionId, title, category, authorName, signatureCount, description, authorId, authorCity, authorCountry, createdDate, closingDate] = await Petition.getOne(id);
            return res.status(200)
                .send({petitionId: petitionId, title: title, category: category, authorName: authorName, signatureCount: signatureCount, description: description,
                authorId: authorId, authorCity: authorCity, authorCountry: authorCountry, createdDate: createdDate, closingDate: closingDate});
            }
    } catch (err) {
        return res.sendStatus(500);
    }
};


//Change a petition's details
exports.changeInfo = async function(req, res){
    try {
        const petitionId = +req.params.id;
        const isValidId = await Petition.isValidPetitionId(petitionId);
        if (!(isValidId)) {
            return res.sendStatus(404);
        } else {
            const author_id = await Petition.getAuthor(petitionId);
            let currToken = req.get('X-Authorization'); // the user making the request
            if (currToken === undefined) { // no one logged in
                return res.sendStatus(401);
            } else {
                const userToken = await User.getToken(author_id); // the one authorised
                if (currToken !== userToken) {
                    return res.sendStatus(403);
                }
            }
        }

        let valid = true;
        if (req.body.closingDate) {
            let currDateTime = new Date();
            if (req.body.closingDate < currDateTime) {
                valid = false;
            }
        }

        if (req.body.categoryId) {
            const categoryExists = await Petition.categoryExists(req.body.categoryId);
            if (!(categoryExists)) {
                valid = false;
            }
        }

        if (valid) {
            const [ogTitle, ogDescription, ogCategoryId, ogClosingDate] = await Petition.getDetails(petitionId);
            let changes = 0;

            if (req.body.title) {
                console.log("title = " + req.body.title);
                const title = req.body.title.toString();
                if (title !== ogTitle) {
                    console.log("1changes = " + changes);
                    changes += 1;
                    //console.log(isSame + " title");
                    await Petition.updateTitle(petitionId, title);
                }
            }

            if (req.body.description) {
                console.log("description = " + req.body.description);
                const description = req.body.description.toString();
                if (description !== ogDescription) {
                    console.log("2changes = " + changes);
                    changes += 1;
                    //console.log(isSame + " description");
                    await Petition.updateDescription(petitionId, description);
                }
            }

            if (req.body.categoryId) {
                console.log("categoryid = " + req.body.categoryId);
                // const categoryId = req.body.categoryId;
                console.log(req.body.categoryId !== ogCategoryId);
                if (req.body.categoryId !== ogCategoryId) {
                    console.log("3changes = " + changes);
                    changes += 1;
                    //console.log(isSame + " categoryId");
                    await Petition.updateCategoryId(petitionId,  req.body.categoryId);
                }
            }

            if (req.body.closingDate) {
                console.log("closingdate = " + req.body.closingDate);
                const closingDate = req.body.closingDate.toString();
                if (closingDate !== ogClosingDate) {
                    console.log("4changes = " + changes);
                    changes += 1;
                    //console.log(isSame + " closingDate");
                    await Petition.updateClosingDate(petitionId, closingDate);
                }
            }

            if (req.body.closingDate == null) {
                if (ogClosingDate != null) {
                    console.log("5changes = " + changes);
                    changes += 1;
                    //console.log(isSame + " nullify closingDate");
                    await Petition.updateClosingDate(petitionId, req.body.closingDate);
                }
            }
            console.log("changes after ifs = " + changes);
            if (changes === 0) {
                return res.sendStatus(400); //TODO ending up here when it shouldn't
            } else {
                return res.sendStatus(200);
            }

        } else {
            return res.sendStatus(400); // for debugging
        }

    } catch (err) {
        //console.log(err)
        return res.sendStatus(500);
    }
};


//Delete a petition
exports.remove = async function(req, res){
    try {
        const petitionId = +req.params.id;
        const isValidId = await Petition.isValidPetitionId(petitionId);
        if (!(isValidId)) {
            return res.sendStatus(404);
        } else {
            const author_id = await Petition.getAuthor(petitionId);
            let currToken = req.get('X-Authorization'); // the user making the request
            if (currToken === undefined) { // no one logged in
                return res.sendStatus(401);
            } else {
                const userToken = await User.getToken(author_id); // the one authorised
                if (currToken !== userToken) {
                    return res.sendStatus(403);
                }
            }
        }

        await Petition.remove(petitionId);
        await Petition.removeAll(petitionId);
        return res.sendStatus(200);

    } catch (err) {
        return res.sendStatus(500);
    }
};


//Retrieve all data about petition categories
exports.listCategories = async function(req, res){
    try {
        const results = await Petition.getCategories();
        if (results === -1) {
            return res.sendStatus(500);
        } else {
            let categories = [];
            for (let i = 0; i < results.length; i++) {
                categories.push({categoryId: results[i].category_id, name: results[i].name});
            }
            return res.status(200)
                .send(categories);
        }
    } catch (err) {
        return res.sendStatus(500);
    }
};


//Retrieve a petition's signatures
exports.listSignatures = async function(req, res){
    try {
        let id = +req.params.id;
        const isValidId = await Petition.isValidPetitionId(id);
        if (!(isValidId)) {
            return res.sendStatus(404);
        } else {
            const results = await Petition.getSignatures(id);
            if (results === -1) {
                return res.sendStatus(500);
            } else {
                return res.status(200)
                    .send(results);
            }
        }
    } catch (err) {
        return res.sendStatus(500);
    }
};


//Sign a petition
exports.signPetition = async function(req, res){
    try {
        let petitionId = +req.params.id;
        const isValidId = await Petition.isValidPetitionId(petitionId);
        if (!(isValidId)) {
            return res.sendStatus(404);
        } else {
            let currToken = req.get('X-Authorization'); // the user making the request
            if (currToken === undefined) { // no one logged in
                return res.sendStatus(401);
            } else {
                const userId = await User.getId(currToken);
                let currDateTime = new Date();
                const hasSigned = await User.hasSigned(userId, petitionId);
                const hasClosed = await Petition.hasClosed(petitionId, currDateTime);
                if (hasSigned || hasClosed) {
                    return res.sendStatus(403);
                } else {
                    let signature_details = [userId, petitionId, currDateTime];
                    await Petition.addSignature(signature_details);
                    return res.sendStatus(201);
                }
            }
        }

    } catch (err) {
        return res.sendStatus(500);
    }
};


//Remove a signature from a petition
exports.removeSignature = async function(req, res){
    try {
        let petitionId = +req.params.id;
        const isValidId = await Petition.isValidPetitionId(petitionId);
        if (!(isValidId)) {
            return res.sendStatus(404);
        } else {
            let currToken = req.get('X-Authorization'); // the user making the request
            if (currToken === undefined) { // no one logged in
                return res.sendStatus(401);
            } else {
                const userId = await User.getId(currToken);
                const author = await Petition.getAuthor(petitionId);
                let currDateTime = new Date();
                const hasSigned = await User.hasSigned(userId, petitionId);
                const hasClosed = await Petition.hasClosed(petitionId, currDateTime);
                if (!(hasSigned) || hasClosed || (userId === author)) {
                    return res.sendStatus(403);
                } else {
                    await Petition.removeOne(userId, petitionId);
                    return res.sendStatus(200);
                }
            }
        }

    } catch (err) {
        return res.sendStatus(500);
    }
};


//Retrieve a petition's hero image
exports.showPhoto = async function(req, res){
    try {
        let id = +req.params.id;
        const isValidId = await Petition.isValidPetitionId(id);
        if (!(isValidId)) {
            return res.sendStatus(404);
        } else {
            const photo_filename = await Petition.getPhoto(id);
            if (photo_filename == null) {
                return res.sendStatus(404);
            } else {
                const type = photo_filename.split('.')[1];
                const image = fs.createReadStream(photoDirectory + photo_filename);

                image.pipe(res);
                res.type(type);
                return res.status(200);
            }
        }
    } catch (err) {
        return res.sendStatus(500);
    }
};


//Set a petition's hero image
exports.setPhoto = async function(req, res){
    try {
        const petitionId = +req.params.id;
        const isValidId = await Petition.isValidPetitionId(petitionId);
        if (!(isValidId)) {
            return res.sendStatus(404);
        } else {
            const author_id = await Petition.getAuthor(petitionId);
            let currToken = req.get('X-Authorization'); // the user making the request
            if (currToken === undefined) { // no one logged in
                return res.sendStatus(401);
            } else {
                const userToken = await User.getToken(author_id); // the one authorised
                if (currToken !== userToken) {
                    return res.sendStatus(403);
                }
            }
        }

        const currPhoto = await Petition.getPhoto(petitionId);
        // get the binary data from the request body and store the photo in a place it can be retrieved from + update database to set the photo_filename
        const photoType = req.get('Content-Type');
        if (photoType === 'image/jpeg') {
            const file = fs.createWriteStream(photoDirectory + 'petition_sample.jpg');
            req.pipe(file);

            // req.on('end', () => {
            //     file.end();
            // });

            await Petition.putPhoto(petitionId, 'petition_sample.jpg');
        } else if (photoType === 'image/png') {
            const file = fs.createWriteStream(photoDirectory + 'petition_sample.png');
            req.pipe(file);

            // req.on('end', () => {
            //     file.end();
            // });

            await Petition.putPhoto(petitionId, 'petition_sample.png');
        } else if (photoType === 'image/gif') {
            const file = fs.createWriteStream(photoDirectory + 'petition_sample.gif');
            req.pipe(file);

            // req.on('end', () => {
            //     file.end();
            // });

            await Petition.putPhoto(petitionId, 'petition_sample.gif');
        } else {
            return res.sendStatus(400);
        }

        if (currPhoto == null) {
            return res.sendStatus(201);
        } else {
            return res.sendStatus(200);
        }

    } catch (err) {
        res.sendStatus(500);
    }
};

