const Petition = require('../models/petition.model');

//View petitions
exports.list = async function(req, res){
    try {
        let q = req.query.q;
        let categoryId = req.query.categoryId;
        let authorId = req.query.authorId;
        let sortBy = req.query.sortBy;
        let startIndex = +req.query.startIndex;
        let count = +req.query.count;
        await Petition.getPetitions(q, categoryId, authorId, sortBy, function(result) {
            if (result === undefined) {
                res.sendStatus(500);
            } else {
                if (!(isNaN(startIndex)) && !(isNaN(count))) { //checking if they exist
                    res.status(200)
                        .json(result.slice(startIndex, startIndex + count));
                } else if (!(isNaN(startIndex))) { //if only the startIndex exists
                    res.status(200)
                        .json(result.slice(startIndex))
                } else {
                    res.status(200)
                        .json(result);
                }
            }
        });
    } catch (err) {
        res.sendStatus(400);
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
    let id = +req.params.id;
    await Petition.getOne(id, function (result) {
        if (result === undefined) {
            res.sendStatus(500);
        } else if (result === "Not found") {
            res.sendStatus(404);
        } else {
            res.status(200)
                .json(result);
        }
    });
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
    await Petition.getCategories(function(result) {
        if (result === undefined) {
            res.sendStatus(500);
        } else {
            res.status(200)
                .json(result);
        }
    });
};


//Retrieve a petition's hero image
exports.showPhoto = async function(req, res){
    let id = +req.params.id;
    await Petition.getPhoto(id, function(result) {
        if (result === undefined) {
            res.sendStatus(500);
        } else if (result === "Not found") {
            res.sendStatus(404);
        } else {
            var filename = result[0].photo_filename;
            res.status(200)
                .sendFile('/home/cosc/student/aph78/Desktop/SENG365/Assignment1/aph78/storage/default/' + filename); // TODO probably not a good way to do this
        }
    });
};


// //TODO set a petition's photo > requires authentication
// exports.setPhoto = async function(req, res){
//     try {
//         const id = +req.params.userId;
//         const result = await User.getOne(id);
//         res.status(200)
//             .send(result);
//     } catch (err) {
//         res.status(500)
//             .send(`ERROR fetching user ${err}`);
//     }
// };


//Retrieve a petition's signatures
exports.listSignatures = async function(req, res){
    let id = +req.params.id;
    await Petition.isValidPetitionId(id, function(isValid) {
        if (!(isValid)) {
            res.sendStatus(404);
        } else {
            Petition.getSignatures(id, function(result) {
                if (result === undefined) {
                    res.sendStatus(500);
                } else {
                    res.status(200)
                        .json(result);
                }
            });
        }
    });
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
