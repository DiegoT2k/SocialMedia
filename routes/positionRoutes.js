const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const User = require('../schemas/UserSchema');

router.get("/", (req, res, next) => {
    
    var payload = {
        pageTitle: "Results"
    }

    res.status(200).render("positionPage", payload);
})

module.exports = router;