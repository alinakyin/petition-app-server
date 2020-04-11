const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const fs = require('fs');
const photoDirectory = './storage/photos/';

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
        let ogPassword = user_data['password'].toString();
        let password = await bcrypt.hash(ogPassword, saltRounds);

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
            return res.sendStatus(400);
        } else {
            const hashedPassword = await User.getPassword(id);
            const passwordIsCorrect = await bcrypt.compare(password, hashedPassword);
            if (passwordIsCorrect) {
                const newToken = await User.insertToken(id);
                if (newToken === -1) {
                    return res.sendStatus(400);
                } else {
                    return res.status(200)
                        .send({userId: id, token: newToken});
                }
            } else {
                return res.sendStatus(400);
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
        if (!(exists) || currToken === undefined) {
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
            const passwordIsCorrect = await bcrypt.compare(currentPassword, ogPassword);
            if (!(passwordIsCorrect)) {
                return res.sendStatus(403);
            }
        } catch (err) {
            return res.sendStatus(400);
        }

        //let isSame = true;
        if (req.body.email) {
            const email = req.body.email.toString();
            const isAvailable = await User.emailAvailable(email);
            if (!(isAvailable) || !(email.includes("@"))) {
                return res.sendStatus(400);
            } else {
                if (email !== ogEmail) {
                    //isSame = false;
                    await User.updateEmail(id, email);
                }
            }
        }

        if (req.body.name) {
            const name = req.body.name.toString();
            if (name !== ogName) {
                //isSame = false;
                await User.updateName(id, name);
            }
        }

        if (req.body.password) {
            const password = req.body.password.toString();
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            if (hashedPassword !== ogPassword) {
                //isSame = false;
                await User.updatePassword(id, hashedPassword);
            }
        }

        if (req.body.city) {
            const city = req.body.city.toString();
            if (city !== ogCity) {
                //isSame = false;
                await User.updateCity(id, city);
            }
        }

        if (req.body.country) {
            const country = req.body.country.toString();
            if (country !== ogCountry) {
                //isSame = false;
                await User.updateCountry(id, country);
            }
        }

        if (Object.keys(req.body).length === 0 || Object.keys(req.body).length === 1) { // req.body empty or only password?
            return res.sendStatus(400);
        } else {
            return res.sendStatus(200);
        }
        // if (isSame) {
        //     return res.sendStatus(400);
        // } else {
        //     return res.sendStatus(200);
        // }

    } catch (err) {
        return res.sendStatus(500);
    }
};


//Set a user's profile photo
exports.setPhoto = async function(req, res){
    try {
        const id = +req.params.id;
        const isValidId = await User.isValidUserId(id);
        if (!(isValidId)) {
            return res.sendStatus(404);
        } else {
            let currToken = req.get('X-Authorization'); // the user making the request
            if (currToken === undefined) { // no one logged in
                return res.sendStatus(401);
            } else {
                const userToken = await User.getToken(id); // the one authorised
                if (currToken !== userToken) {
                    return res.sendStatus(403);
                }
            }
        }

        const currPhoto = await User.getPhoto(id);
        // get the binary data from the request body and store the photo in a place it can be retrieved from + update database to set the photo_filename
        const photoType = req.get('Content-Type');
        if (photoType === 'image/jpeg') {
            let currDateTime = new Date().toString();
            const photoName = 'user_' + id + '_' + Date.parse(currDateTime) + '.jpg';
            const image = req.body;
            fs.writeFileSync(photoDirectory + photoName, image);
            //const file = fs.createWriteStream(photoDirectory + photoName);
            //req.pipe(file);

            await User.putPhoto(id, photoName);
        } else if (photoType === 'image/png') {
            let currDateTime = new Date().toString();
            const photoName = 'user_' + id + '_' + Date.parse(currDateTime) + '.png';
            const image = req.body;
            fs.writeFileSync(photoDirectory + photoName, image);
            //const file = fs.createWriteStream(photoDirectory + photoName);
            //req.pipe(file);

            await User.putPhoto(id, photoName);
        } else if (photoType === 'image/gif') {
            let currDateTime = new Date().toString();
            const photoName = 'user_' + id + '_' + Date.parse(currDateTime) + '.gif';
            const image = req.body;
            fs.writeFileSync(photoDirectory + photoName, image);
            //const file = fs.createWriteStream(photoDirectory + photoName);
            //req.pipe(file); // pipes the data to the file to store it

            await User.putPhoto(id, photoName);
        } else {
            return res.sendStatus(400);
        }

        if (currPhoto == null) {
            return res.sendStatus(201);
        } else {
            return res.sendStatus(200);
        }

    } catch (err) {
        return res.sendStatus(500);
    }
};


//Retrieve a user's profile photo
exports.showPhoto = async function(req, res){
    try {
        let id = +req.params.id;
        const isValidId = await User.isValidUserId(id);
        if (!(isValidId)) {
            return res.sendStatus(404);
        } else {
            const photo_filename = await User.getPhoto(id);
            if (photo_filename == null) {
                return res.sendStatus(404);
            } else {
                const type = photo_filename.split('.')[1];
                const image = fs.readFileSync(photoDirectory + photo_filename);
                //const image = fs.createReadStream(photoDirectory + photo_filename);

                //image.pipe(res);
                res.type(type);
                res.send(image);
                return res.status(200);
            }
        }
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
};


//Delete a user's profile photo
exports.removePhoto = async function(req, res){
    try {
        const id = +req.params.id;
        const isValidId = await User.isValidUserId(id);
        if (!(isValidId)) {
            return res.sendStatus(404);
        } else {
            let currToken = req.get('X-Authorization'); // the user making the request
            if (currToken === undefined) { // no one logged in
                return res.sendStatus(401);
            } else {
                const userToken = await User.getToken(id); // the one authorised
                if (currToken !== userToken) {
                    return res.sendStatus(403);
                }
            }
        }
        await User.deletePhoto(id);
        return res.sendStatus(200);

    } catch (err) {
        return res.sendStatus(500);
    }
};


