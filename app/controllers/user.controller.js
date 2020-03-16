const User = require('../models/user.model');

//Register as a new user
exports.register = async function(req, res){
    try {
        let user_data = {
            "name": req.body.name,
            "email": req.body.email,
            "password": req.body.password,
            "city": req.body.city,
            "country": req.body.country
        };

        let name = user_data['name'].toString();
        let email = user_data['email'].toString();
        let password = user_data['password'].toString();

        let city = user_data['city'];
        if (city != null) {
            city.toString();
        }
        let country = user_data['country'];
        if (country != null) {
            country.toString();
        }

        const isAvailable = await User.emailAvailable(email);
        if (!(isAvailable) || !(email.includes("@")) || password === "" || password === undefined) {
            res.sendStatus(400);
        } else {
            let user_details = [name, email, password, city, country];
            let insertId = await User.insert(user_details);
            if (insertId === -1) {
                res.sendStatus(400);
            } else {
                res.status(201)
                    .send({userId: insertId});
            }
        }

    } catch (err) {
        res.sendStatus(400);
    }
};

//Log in as an existing user
exports.login = async function(req, res){
    try {
        let user_data = {
            "email": req.body.email,
            "password": req.body.password
        };

        let email = user_data['email'].toString();
        let password = user_data['password'].toString();

        // generate token, insert token into database, send back userId associated with the email and the token generated
        const id = await User.getUserByEmail(email);
        if (id === -1) {
            res.sendStatus(500);
        } else {
            const newToken = await User.insertToken(id);
            if (newToken === -1) {
                res.sendStatus(500);
            } else {
                res.status(200)
                    .send({userId: id, token: newToken});
            }
        }
    } catch (err) {
        res.sendStatus(400);
    }
};

// req.get('X-Authorization');

/*
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


 */