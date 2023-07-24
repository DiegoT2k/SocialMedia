const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt");
const User = require('../schemas/UserSchema');

router.get("/", (req, res, next) => {
    var payload = {
        pageTitle: "Pagina con le carte del gioco"
    }
    res.status(200).render("cardPage", payload);
})

module.exports = router;