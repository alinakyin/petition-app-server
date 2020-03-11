const petitions = require('../controllers/petition.controller');

module.exports = function(app) {
    app.route(app.rootUrl + '/petitions')
        .get(petitions.list)
        .post(petitions.add);

    app.route(app.rootUrl + '/petitions/:id')
        .get(petitions.listInfo)
        .patch(petitions.changeInfo)
        .delete(petitions.remove);

    app.route(app.rootUrl + '/petitions/categories')
        .get(petitions.listCategories);

    app.route(app.rootUrl + '/petitions/:id/photo')
        .get(petitions.showPhoto)
        .put(petitions.setPhoto);

    app.route(app.rootUrl + '/petitions/:id/signatures')
        .get(petitions.listSignatures)
        .post(petitions.signPetition)
        .delete(petitions.removeSignature)
};
