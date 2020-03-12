const User = require('../models/user.model');

//Register as a new user
exports.register = async function(req, res){
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

exports.login = async function(req, res){
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

exports.logout = async function(req, res){
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

exports.getInfo = async function(req, res){
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

exports.getPhoto = async function(req, res){
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

exports.removePhoto = async function(req, res){
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
