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
            res.sendStatus(500);
        } else {
            if (!(isNaN(startIndex)) && !(isNaN(count))) { //checking if they exist
                res.status(200)
                    .send(results.slice(startIndex, startIndex + count));
            } else if (!(isNaN(startIndex))) { //if only the startIndex exists
                res.status(200)
                    .send(results.slice(startIndex))
            } else {
                res.status(200)
                    .send(results);
            }
        }

    } catch (err) {
        res.sendStatus(500);
    }
};


// //TODO post a petition > requires authentication
// exports.add = async function(req, res){
//     try {
//         let user_data = {
//             "username": req.body.username
//         };
//         let user = user_data['username'].toString();
//         let values = [
//             [user]
//         ];
//         const result = await User.insert(values);
//         res.status(201)
//             .send(`Inserted ${req.body.username} at id ${result}`);
//     } catch (err) {
//         res.status(500)
//             .send(`ERROR posting user ${err}`);
//     }
// };


//Retrieve detailed information about a petition
exports.listInfo = async function(req, res) {
    try {
        let id = +req.params.id;
        const isValidId = await Petition.isValidPetitionId(id);
        if (!(isValidId)) {
            res.sendStatus(404);
        } else {
            const results = await Petition.getOne(id);
            if (results === -1) {
                res.sendStatus(500);
            } else {
                res.status(200)
                    .send(results);
            }
        }
    } catch (err) {
        res.sendStatus(500);
    }
};


// //TODO patch a petition > requires authentication
// exports.changeInfo = async function(req, res){
//     try {
//         let id = +req.params.userId;
//         let user_data = {
//             "username": req.body.username
//         };
//         let user = user_data['username'].toString();
//
//         const result = await User.alter(user, id);
//         res.status(201)
//             .send(`Updated user at id ${id}`);
//     } catch (err) {
//         res.status(500)
//             .send(`ERROR updating user ${err}`);
//     }
// };


// //TODO delete a petition > requires authentication
// exports.remove = async function(req, res){
//     try {
//         let id = +req.params.userId;
//         const result = await User.remove(id);
//         res.status(201)
//             .send(`Deleted user with id ${id}`);
//     } catch (err) {
//         res.status(500)
//             .send(`ERROR deleting user ${err}`);
//     }
// };


//Retrieve all data about petition categories
exports.listCategories = async function(req, res){
    try {
        const results = await Petition.getCategories();
        if (results === -1) {
            res.sendStatus(500);
        } else {
            res.status(200)
                .send(results);
        }
    } catch (err) {
        res.sendStatus(500);
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
            res.sendStatus(404);
        } else {
            const results = await Petition.getSignatures(id);
            if (results === -1) {
                res.sendStatus(500);
            } else {
                res.status(200)
                    .send(results);
            }
        }
    } catch (err) {
        res.sendStatus(500);
    }
};


//TODO sign a petition > requires authentication
// exports.signPetition = async function(req, res){
//     try {
//         let user_data = {
//             "username": req.body.username
//         };
//         let user = user_data['username'].toString();
//         let values = [
//             [user]
//         ];
//         const result = await User.insert(values);
//         res.status(201)
//             .send(`Inserted ${req.body.username} at id ${result}`);
//     } catch (err) {
//         res.status(500)
//             .send(`ERROR posting user ${err}`);
//     }
// };


// //TODO remove signature > requires authentication
// exports.removeSignature = async function(req, res){
//     try {
//         let id = +req.params.userId;
//         const result = await User.remove(id);
//         res.status(201)
//             .send(`Deleted user with id ${id}`);
//     } catch (err) {
//         res.status(500)
//             .send(`ERROR deleting user ${err}`);
//     }
// };
