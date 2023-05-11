const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt");
const { validate } = require('../schemas/UserSchema');

router.get("/:id", (req, res, next) => {

    var payload = {
        pageTitle: "TimeOut",
        tempo: req.params.id
    }
    
    res.status(200).render("timeOut", payload);
})

module.exports = router;