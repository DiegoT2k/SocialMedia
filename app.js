const express = require('express');
const app = express();
const port = 3000;
const middleware = require('./middleware')
const path = require('path')
const bodyParser = require("body-parser")
const mongoose = require("./database");
const session = require('express-session');
const User = require('./schemas/UserSchema');
const http  = require('http');
const server = app.listen(port, () => console.log("Server listening on port " + port));
const io = require("socket.io")(server, { pingTimeout: 60000 });

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false })); //app.use(bodyParser.urlencoded({ extended: false })); //bodyParser deprecated in Express v4.16+ // amended for ./routes/{loginRoutes, logout}.js
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
	secret: "beef cake",
	resave: true,
	saveUninitialized: false
}))

// Routes
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const logoutRoute = require('./routes/logout');
const postRoute = require('./routes/postRoutes');
const profileRoute = require('./routes/profileRoutes');
const uploadRoute = require('./routes/uploadRoutes');
const searchRoute = require('./routes/searchRoutes');
const messagesRoute = require('./routes/messagesRoutes');
const notificationsRoute = require('./routes/notificationsRoutes');
const positionRoute = require('./routes/positionRoutes');
const timeOutRoute = require('./routes/timeOutRoutes');
const bonusRoute = require('./routes/bonusRoutes');
const cardRoute = require('./routes/cardRoutes');
const imprevistiRoute = require('./routes/imprevistiRoutes');

// API Routes
const postsApiRoute = require('./routes/api/postsAPI');
const usersApiRoute = require('./routes/api/usersAPI');
const chatsApiRoute = require('./routes/api/chatsAPI');
const messagesApiRoute = require('./routes/api/messagesAPI');
const notificationsApiRoute = require('./routes/api/notificationsAPI');
const positionsApiRoute = require('./routes/api/positionsAPI');

//Use Routes
app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/logout", logoutRoute);
app.use("/posts", middleware.requireLogin, postRoute);
app.use("/profile", middleware.requireLogin, profileRoute);
app.use("/uploads", uploadRoute);
app.use("/search", middleware.requireLogin, searchRoute);
app.use("/messages", middleware.requireLogin, messagesRoute);
app.use("/notifications", middleware.requireLogin, notificationsRoute);
app.use("/position", middleware.requireLogin, positionRoute);
app.use("/timeOut", middleware.requireLogin, timeOutRoute);
app.use("/bonus", middleware.requireLogin, bonusRoute);
app.use("/card", middleware.requireLogin, cardRoute);
app.use("/imprevisti", middleware.requireLogin, imprevistiRoute);

//Use API Routes
app.use("/api/posts", postsApiRoute);
app.use("/api/users", usersApiRoute);
app.use("/api/chats", chatsApiRoute);
app.use("/api/messages", messagesApiRoute);
app.use("/api/notifications", notificationsApiRoute);
app.use("/api/position", positionsApiRoute);


app.get("/", middleware.requireLogin, (req, res, next) => {

    var payload = {
        pageTitle: "Home",
		userLoggedIn: req.session.user,
		//userLoggedInJs: '{' + '"_id":' + JSON.stringify(req.session.user._id) + '}', //Modified for security purposes
		userLoggedInJs: JSON.stringify(req.session.user),
    }

    res.status(200).render("home", payload);
})

app.get("/postFollowingPage", middleware.requireLogin, (req, res, next) => {

    var payload = {
        pageTitle: "Post",
		userLoggedIn: req.session.user,
		//userLoggedInJs: '{' + '"_id":' + JSON.stringify(req.session.user._id) + '}', //Modified for security purposes
		userLoggedInJs: JSON.stringify(req.session.user),
    }

    res.status(200).render("postFollowingPage", payload);
})
/**
io.on("connection", socket => {
	
    socket.on("setup", userData => {
        socket.join(userData._id);
        socket.emit("connected");
    })

    socket.on("notification received", room => socket.in(room).emit("notification received"));
    
}) 
 */
io.on("connection", socket => {
	

    socket.on("setup", userData => {
        socket.join(userData._id);
        socket.emit("connected");
    })

    socket.on("notification received", room => {
        //console.log("received notification in room:", room)
        socket.in(room).emit("notification received")
    });
    
    socket.on("notification all", (newNotification) => {
        //console.log("ALL");

        const query = User.find({}, {'_id' : 1})    

        query.exec()
        .then(users => {
            // Estrai gli ID degli utenti dall'array di utenti
            const userIDs = users.map(user => user._id);
    
            // Ora userIDs contiene un array di tutti gli ID degli utenti nel database
            //console.log("Array di ID degli utenti:", userIDs);

            for (let i = 0; i < userIDs.length; i++) {
                socket.in(userIDs[i]).emit("notification all received");
            }
        })
  


        //socket.emit("notification all received")
    });

}); 


module.exports = io;