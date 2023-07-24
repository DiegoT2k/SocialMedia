const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt");
const User = require('../schemas/UserSchema');

router.get("/", (req, res, next) => {

    var payload = {
        pageTitle: "Probabilità e imprevisti"
    }

    res.status(200).render("imprevisti", payload);
})

module.exports = router;