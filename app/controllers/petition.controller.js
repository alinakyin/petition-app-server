const Petition = require('../models/petition.model');

// View petitions
exports.list = async function(req, res){
    try {
        let q = req.query.q;
        let categoryId = req.query.categoryId;
        let authorId = req.query.authorId;
        let sortBy = req.query.sortBy;
        const result = await Petition.getPetitions(q, categoryId, authorId, sortBy);

        let startIndex = req.query.startIndex;
        let count = req.query.count;

        if (startIndex != null && count != null) {
            res.status(200)
                .send(result.slice(startIndex, startIndex+count));
        } else {
            res.status(200)
                .send(result);
        }

    } catch (err) {
        res.status(500)
            .send(`ERROR getting petitions ${err}`);
    }
};


//TODO Requires authentication
exports.add = async function(req, res){
    try {
        let user_data = {
            "username": req.body.username
        };
        let user = user_data['username'].toString();
        let values = [
            [user]
        ];
        const result = await User.insert(values);
        res.status(201)
            .send(`Inserted ${req.body.username} at id ${result}`);
    } catch (err) {
        res.status(500)
            .send(`ERROR posting user ${err}`);
    }
};


//Retrieve detailed information about a petition
exports.listInfo = async function(req, res){
    try {
        const id = +req.params.id;
        const result = await Petition.getOne(id);
        res.status(200)
            .send(result);
    } catch (err) {
        res.status(500)
            .send(`ERROR fetching petition ${err}`);
    }
};


exports.changeInfo = async function(req, res){
    try {
        let id = +req.params.userId;
        let user_data = {
            "username": req.body.username
        };
        let user = user_data['username'].toString();

        const result = await User.alter(user, id);
        res.status(201)
            .send(`Updated user at id ${id}`);
    } catch (err) {
        res.status(500)
            .send(`ERROR updating user ${err}`);
    }
};

exports.remove = async function(req, res){
    try {
        let id = +req.params.userId;
        const result = await User.remove(id);
        res.status(201)
            .send(`Deleted user with id ${id}`);
    } catch (err) {
        res.status(500)
            .send(`ERROR deleting user ${err}`);
    }
};

exports.listCategories = async function(req, res){
    try {
        const result = await User.getAll();
        res.status(200)
            .send(result);
    } catch (err) {
        res.status(500)
            .send(`ERROR getting users ${err}`);
    }
};

exports.showPhoto = async function(req, res){
    try {
        const id = +req.params.userId;
        const result = await User.getOne(id);
        res.status(200)
            .send(result);
    } catch (err) {
        res.status(500)
            .send(`ERROR fetching user ${err}`);
    }
};

exports.setPhoto = async function(req, res){
    try {
        const id = +req.params.userId;
        const result = await User.getOne(id);
        res.status(200)
            .send(result);
    } catch (err) {
        res.status(500)
            .send(`ERROR fetching user ${err}`);
    }
};

exports.listSignatures = async function(req, res){
    try {
        const result = await User.getAll();
        res.status(200)
            .send(result);
    } catch (err) {
        res.status(500)
            .send(`ERROR getting users ${err}`);
    }
};

exports.signPetition = async function(req, res){
    try {
        let user_data = {
            "username": req.body.username
        };
        let user = user_data['username'].toString();
        let values = [
            [user]
        ];
        const result = await User.insert(values);
        res.status(201)
            .send(`Inserted ${req.body.username} at id ${result}`);
    } catch (err) {
        res.status(500)
            .send(`ERROR posting user ${err}`);
    }
};

exports.removeSignature = async function(req, res){
    try {
        let id = +req.params.userId;
        const result = await User.remove(id);
        res.status(201)
            .send(`Deleted user with id ${id}`);
    } catch (err) {
        res.status(500)
            .send(`ERROR deleting user ${err}`);
    }
};
