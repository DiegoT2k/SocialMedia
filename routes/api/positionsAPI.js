const express = require('express');
const app = express();
const router = express.Router();
const User = require('../../schemas/UserSchema');

app.use(express.urlencoded({ extended: false }));

router.get("/", async (req, res) => {

    var results = User.find({})
    .sort({ "punteggio": -1 });

    results = await User.populate(results, { path: "replyTo.postedBy" });
   
    res.status(200).send(results);
});

module.exports = router;