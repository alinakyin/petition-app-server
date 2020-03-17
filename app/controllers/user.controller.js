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
            return res.sendStatus(400);
        } else {
            let user_details = [name, email, password, city, country];
            let insertId = await User.insert(user_details);
            if (insertId === -1) {
                return res.sendStatus(400);
            } else {
                return res.status(201)
                    .send({userId: insertId});
            }
        }

    } catch (err) {
        return res.sendStatus(400);
    }
};

//Log in as an existing user (changed 500 to 400?)
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
            return res.sendStatus(400);
        } else {
            const newToken = await User.insertToken(id);
            if (newToken === -1) {
                return res.sendStatus(400);
            } else {
                return res.status(200)
                    .send({userId: id, token: newToken});
            }
        }
    } catch (err) {
        return res.sendStatus(400);
    }
};

//Log out the currently authorised user
exports.logout = async function(req, res){
    try {
        let currToken = req.get('X-Authorization');
        const exists = await User.tokenExists(currToken);
        if (!(exists)) {
            return res.sendStatus(401);
        } else {
            await User.deleteToken(currToken);
            return res.sendStatus(200);
        }
    } catch (err) {
        return res.sendStatus(500);
    }
};

//Retrieve information about a user
exports.getInfo = async function(req, res){
    try {
        const id = +req.params.id;
        let currToken = req.get('X-Authorization');
        const [name, city, country, email] = await User.getSomeDetails(id);

        // Compare currToken with auth_token of user with that id, if same show email, if not only name, city and country
        const userToken = await User.getToken(id);

        if (currToken === userToken) {
            return res.status(200)
                .send({name: name, city: city, country: country, email: email});
        } else {
            return res.status(200)
                .send({name: name, city: city, country: country});
        }

    } catch (err) {
        return res.sendStatus(404);
    }
};

//Change a user's details
exports.changeInfo = async function(req, res) {
    try {
        const id = +req.params.id;
        let currToken = req.get('X-Authorization'); // the user making the patch
        const userToken = await User.getToken(id); // the one you're patching

        if (currToken !== userToken) {
            return res.sendStatus(401);
        }

        const [ogName, ogEmail, ogPassword, ogCity, ogCountry] = await User.getDetails(id);

        try {
            const currentPassword = req.body.currentPassword.toString();
            if (!(currentPassword === ogPassword)) {
                return res.sendStatus(403);
            }
        } catch (err) {
            return res.sendStatus(400);
        }

        var isSame = true;
        if (req.body.name) {
            const name = req.body.name.toString();
            if (name !== ogName) {
                isSame = false;
                await User.updateName(id, name);
            }
        } else if (req.body.email) {
            const email = req.body.email.toString();
            const isAvailable = await User.emailAvailable(email);
            if (!(isAvailable) || !(email.includes("@"))) {
                res.sendStatus(400);
            } else {
                if (email !== ogEmail) {
                    isSame = false;
                    await User.updateEmail(id, email);
                }
            }
        } else if (req.body.password) {
            const password = req.body.password.toString();
            if (password !== ogPassword) {
                isSame = false;
                await User.updatePassword(id, password);
            }
        } else if (req.body.city) {
            const city = req.body.city.toString();
            if (city !== ogCity) {
                isSame = false;
                await User.updateCity(id, city);
            }
        } else if (req.body.country) {
            const country = req.body.country.toString();
            if (country !== ogCountry) {
                isSame = false;
                await User.updateCountry(id, country);
            }
        }

        if (isSame) {
            return res.sendStatus(400);
        } else {
            return res.sendStatus(200);
        }

    } catch (err) {
        return res.sendStatus(500);
    }
};

/*
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