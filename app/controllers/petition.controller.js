const Petition = require('../models/petition.model');
const User = require('../models/user.model');

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
            const results = await Petition.getOne(id);
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

        var valid = true;
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
            var isSame = true;
            if (req.body.title) {
                const title = req.body.title.toString();
                if (title !== ogTitle) {
                    isSame = false;
                    await Petition.updateTitle(petitionId, title);
                }
            }

            if (req.body.description) {
                const description = req.body.description.toString();
                if (description !== ogDescription) {
                    isSame = false;
                    await Petition.updateDescription(petitionId, description);
                }
            }

            if (req.body.categoryId) {
                const categoryId = req.body.categoryId;
                if (categoryId !== ogCategoryId) {
                    isSame = false;
                    await Petition.updateCategoryId(petitionId, categoryId);
                }
            }

            if (req.body.closingDate) {
                const closingDate = req.body.closingDate.toString();
                if (closingDate !== ogClosingDate) {
                    isSame = false;
                    await Petition.updateClosingDate(petitionId, closingDate);
                }
            }

            if (isSame) {
                return res.sendStatus(400);
            } else {
                return res.sendStatus(200);
            }

        } else {
            return res.sendStatus(406); // for debugging
        }

    } catch (err) {
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
        res.sendStatus(200);

    } catch (err) {
        res.sendStatus(500);
    }
};


//Retrieve all data about petition categories
exports.listCategories = async function(req, res){
    try {
        const results = await Petition.getCategories();
        if (results === -1) {
            return res.sendStatus(500);
        } else {
            return res.status(200)
                .send(results);
        }
    } catch (err) {
        return res.sendStatus(500);
    }
};


// //TODO Retrieve a petition's hero image (depends on setPhoto)
// exports.showPhoto = async function(req, res){
//     try {
//         let id = +req.params.id;
//         const isValidId = await Petition.isValidPetitionId(id);
//         if (!(isValidId)) {
//             res.sendStatus(404);
//         } else {
//             const photo_filename = await Petition.getPhoto(id);
//             res.status(200)
//                 .sendFile('/home/cosc/student/aph78/Desktop/SENG365/Assignment1/aph78/storage/default/' + photo_filename); // TODO probably not a good way to do this
//         }
//     } catch (err) {
//         res.sendStatus(500);
//     }
// };
//
//
// //TODO Set a petition's hero image
// //Photos located at /home/cosc/student/aph78/Postman/files

// exports.setPhoto = async function(req, res){
//     try {
//         const petitionId = +req.params.id;
//         const isValidId = await Petition.isValidPetitionId(petitionId);
//         if (!(isValidId)) {
//             res.sendStatus(404);
//         } else {
//             const author_id = await getAuthor(petitionId);
//             let currToken = req.get('X-Authorization'); // the user making the request
//             if (currToken === undefined) { // no one logged in
//                 res.sendStatus(401);
//             } else {
//                 const userToken = await User.getToken(author_id); // the one authorised
//                 if (currToken !== userToken) {
//                     res.sendStatus(403); // TODO should return this?? to end the function
//                 }
//             }
//
//             const photoType = req.get('Content-Type');
//             if (photoType !== ('image/png' || 'image/jpeg' || 'image/gif')) {
//                 res.sendStatus(400);
//             } else {
//                 const photo = req.body;
//                 console.log(photo);
//                 await Petition.putPhoto(petitionId, photo);
//             }
//
//             const currPhoto = await Petition.getPhoto(petitionId);
//             if (currPhoto === undefined) {
//                 res.sendStatus(201);
//             } else {
//                 res.sendStatus(200);
//             }
//         }
//     } catch (err) {
//         console.log(err);
//         res.sendStatus(500);
//     }
// };


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


// Remove a signature from a petition
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
