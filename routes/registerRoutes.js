const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt');
const User = require('../schemas/UserSchema');


app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res, next) => {

    res.status(200).render("register");
})

router.post("/", async (req, res, next) => {

    var firstName = req.body.firstName.trim();
    var username = req.body.username.trim();
    var password = req.body.password;
    var profilePic = req.body.profilePic;
    var bio = req.body.bio;

    var payload = {
        firstName: firstName,
        username: username,
        password: password,
        profilePic: profilePic,
        bio: bio
      };

    if(firstName && username && password) 
    {
        var user = await User.findOne({
            $or: [
                { username: username }
            ]
        })
        .catch((error) => {
            console.log(error);
            payload.errorMessage = "Something went wrong.";
            res.status(200).render("register", payload);
        });

        if(user == null) 
        {
            // No user found

            var data = req.body;

            //Hash password
            //2^10 = 1024 iterations
            //const saltRounds = 10;
            data.password = await bcrypt.hash(password, 10)

            User.create(data)
            .then((user) => {
                req.session.user = user;
                return res.redirect("/");
            })
        }
        else 
        {
            // User found

            payload.errorMessage = "Username already in use.";
            res.status(200).render("register", payload);
        }
        
        

    }
    else 
    {
        payload.errorMessage = "Make sure each field has a valid value.";
        res.status(200).render("register", payload);
    }
})

module.exports = router;