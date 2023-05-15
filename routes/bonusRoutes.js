const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt");
const User = require('../schemas/UserSchema');

router.get("/:nome/:azione/:punti", (req, res, next) => {

    var payload = {
        pageTitle: "News",
        nome: req.params.nome,
        azione: req.params.azione,
        punti: req.params.punti,
        userLoggedIn: req.session.user,
    }
    
    User.findByIdAndUpdate(payload.userLoggedIn,  { $inc : {punteggio : payload.punti} } )
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    });

    res.status(200).render("bonus", payload);
})

module.exports = router;