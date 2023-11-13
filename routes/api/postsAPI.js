const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');
const Notification = require('../../schemas/NotificationSchema');
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const upload = multer({ dest: "uploads/" }); //Profile image directory


app.use(express.urlencoded({ extended: false }));

router.get("/", async (req, res, next) => {

    var searchObj = req.query; 

    //Prepare searchObj for getPosts(filter)
    if(searchObj.isReply !== undefined)
    {
        var isReply = searchObj.isReply == "true";
        searchObj.replyTo = { $exists: isReply };
        delete searchObj.isReply; //delete property from JS object
    }

    //Case in-sensitive search
    if(searchObj.search !== undefined)
    {
        searchObj.content = { $regex: searchObj.search, $options: "i" };
        delete searchObj.search;
    }

    //Only show if following
    if(searchObj.followingOnly !== undefined) {
        var followingOnly = searchObj.followingOnly == "true";

        if(followingOnly) {
            var objectIds = [];
            
            //Checks if array does NOT exist //Error handling
            if(!req.session.user.following) {
                req.session.user.following = [];
            }

            req.session.user.following.forEach(user => {
                objectIds.push(user);
            })

            objectIds.push(req.session.user._id);
            searchObj.postedBy = { $in: objectIds };
        }
        
        delete searchObj.followingOnly;
    }
    //io.emit("postAggiornato");
    var results = await getPosts(searchObj);
    res.status(200).send(results);
})

const azzeramentoPunteggio = async () => {
    try {
        // Trova tutti gli utenti e imposta il campo 'punteggio' a 0 per ognuno di essi
        await User.updateMany({}, { punteggio: 0 });
        console.log('Azzeramento dei punteggi completato con successo.');
    } catch (error) {
        console.error('Errore durante l\'azzeramento dei punteggi:', error);
    }
}

router.get("/abcdefg", async (req, res, next) => {
    try {
        await azzeramentoPunteggio();
        return res.redirect("/");
    } catch (error) {
        return res.redirect("/");
    }
});

router.get("/:id/:frase", async (req, res, next) => {

    var postData = {
        postedBy: req.params.id,
        content: req.params.frase
    }

    try {

    var user = await User.findById(postData.postedBy);

    if(!user){return};       

    var payload = {
        pageTitle: "Home",
		userLoggedIn: req.session.user,
		userLoggedInJs: JSON.stringify(req.session.user),
    }
    
    var postId;
    Post.create(postData)
    .then(async (newPost) => {
        newPost = await User.populate(newPost, { path: "postedBy" })
        newPost = await Post.populate(newPost, { path: "replyTo" })
        postId = newPost._id
    })
    .then(() => {
        // Esegui il reindirizzamento a "/" senza i parametri dell'URL
        res.redirect("/");

        setTimeout(() => {
            Post.findByIdAndDelete(postId).catch((error) => {
                console.error(error);
            });
        }, 60000); // 1 minuto
    })
    .catch((error) => {
        console.error(error);
        res.sendStatus(500);
    });

    } catch (error) {
        return res.redirect("/");
    }

   
})

router.get("/:id", async (req, res, next) => {

    var postId = req.params.id;

    try{

    var postData = await getPosts({ _id: postId });

    if(!postData){return};

    postData = postData[0];

    var results = {
        postData: postData
    }
    
    if(postData !== undefined) 
    {
       results.replyTo = postData.replyTo;
    }
 
    results.replies = await getPosts({ replyTo: postId });

    res.status(200).send(results);

} catch (error) {
    return res.redirect("/");
}
})

router.post("/", async (req, res, next) => {
    if(!req.body.content)
    {
        console.log("Content param not sent with request");
        return res.sendStatus(400);
    }

    var postData = {
        content: req.body.content,
        postedBy: req.session.user
    }

    if(req.body.replyTo)
    {
        postData.replyTo = req.body.replyTo;
    }

    Post.create(postData)
    .then(async (newPost) => {
        newPost = await User.populate(newPost, { path: "postedBy" })
        newPost = await Post.populate(newPost, { path: "replyTo" })

        if(newPost.replyTo !== undefined)
        {
            await Notification.insertNotification(newPost.replyTo.postedBy, req.session.user._id, "reply", newPost._id);
        }

        res.status(201).send(newPost);
    })
    .catch((error) => {
        console.log(error);
        res.sendStatus(400);
    })
    
})

router.put("/:id/like", async (req, res, next) => {

    var postId = req.params.id;
    var userId = req.session.user._id;
    
    var userPost = await Post.findById(postId)            
        .catch(error => {
        console.log(error);
        res.sendStatus(400);
    });

    try{
        var sp = await User.findById(userPost.postedBy)            
    }catch(error){
        console.log(error);
        res.sendStatus(400);
    };

    var payload = {
        pageTitle: "Home",
		userLoggedIn: req.session.user,
		userLoggedInJs: JSON.stringify(req.session.user),
    }

    if(!userPost || !userPost.postedBy){
        res.status(200).render("home", payload);
        return;
    }

    //Decide whether like or unlike
    var isLiked = req.session.user.likes && req.session.user.likes.includes(postId); 

    var option = isLiked == true ? "$pull" : "$addToSet";

    const user = await User.findById(userId)            
        .catch(error => {
        console.log(error);
        res.sendStatus(400);
    });

    // Incrementa numLike per il proprietario del post
    if(isLiked){
        if(sp.shadow && !sp.special){
            await User.findByIdAndUpdate(user._id, { $inc: { punteggio: -4, numLike: -1 } })
            .catch(error => {
                console.log(error);
                res.sendStatus(400);
            });
        }else if(!sp.special){
            await User.findByIdAndUpdate(userPost.postedBy,  { $inc : {punteggio : -3, numLike : -1} } )
            .catch(error => {
                console.log(error);
                res.sendStatus(400);
            });
            await User.findByIdAndUpdate(user._id, { $inc: { punteggio: -1.5, numLike: -1 } })
            .catch(error => {
                console.log(error);
                res.sendStatus(400);
            });
        }

    }else{
        
        if(sp.shadow && !sp.special){
            await User.findByIdAndUpdate(user._id, { $inc: { punteggio: +4, numLike: +1 } })
            .catch(error => {
                console.log(error);
                res.sendStatus(400);
            });
        }else if(!sp.special){
            await User.findByIdAndUpdate(userPost.postedBy,  { $inc : {punteggio : +3, numLike : +1 } })
            .catch(error => {
                console.log(error);
                res.sendStatus(400);
            });
            await User.findByIdAndUpdate(user._id, { $inc: { punteggio: +1.5, numLike: +1 } })
            .catch(error => {
                console.log(error);
                res.sendStatus(400);
            });           
        }

    }

    //Insert/pull user like
    //Checks if likes [array] exists (error handling)
    //req.session.user updated after operation 
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { likes: postId } }, { new: true })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    // Insert/pull post like
    var post = await Post.findByIdAndUpdate(postId, { [option]: { likes: userId } }, { new: true })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    if(!isLiked)
    {
        await Notification.insertNotification(post.postedBy, userId, "postLike", post._id);
    }

    res.status(200).send(post);
})

router.put("/:id/comment", async (req, res, next) => {

    var postId = req.params.id;
    var userId = req.session.user._id;

    const user = await User.findById(userId)            
        .catch(error => {
        console.log(error);
        res.sendStatus(400);
    });

    var userPost = await Post.findById(postId)        
        .catch(error => {
        console.log(error);
        res.sendStatus(400);
    });

    var sp = await User.findById(userPost.postedBy)            
        .catch(error => {
        console.log(error);
        res.sendStatus(400);
    });


    if(!userPost || !userPost.postedBy){
        res.redirect("/");
        return;
    }

    var option = "$push";

    //Insert/pull user comments
    //Checks if likes [array] exists (error handling)
    //req.session.user updated after operation 
    
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { comments: postId } }, { new: true })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    // Insert/pull post comment
    var post = await Post.findByIdAndUpdate(postId, { [option]: { comments: userId } }, { new: true })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
    
    // Incrementa numComment per il proprietario del post  
    if(sp.shadow && !sp.special){
        await User.findByIdAndUpdate(user._id,  { $inc : {punteggio : 6, numComment : 1} } )
            .catch(error => {            
            console.log(error);
            res.sendStatus(400);
        });           
    }else if(!sp.special){
        await User.findByIdAndUpdate(userPost.postedBy,  { $inc : {numComment : 1, punteggio : 5} } )
            .catch(error => {
            console.log(error);
            res.sendStatus(400);
        });

        await User.findByIdAndUpdate(user._id,  { $inc : {punteggio : 2.5, numComment: 1} } )
            .catch(error => {            
            console.log(error);
            res.sendStatus(400);
        });        
    }  


    res.status(200).send(post);
})

router.post("/:id/retweet", async (req, res, next) => {
    var postId = req.params.id;
    var userId = req.session.user._id;

    const user = await User.findById(userId)            
        .catch(error => {
        console.log(error);
        res.sendStatus(400);
    });

    var userPost = await Post.findById(postId);

    var sp = await User.findById(userPost.postedBy)            
        .catch(error => {
        console.log(error);
        res.sendStatus(400);
    });
    
    var payload = {
        pageTitle: "Home",
		userLoggedIn: req.session.user,
		userLoggedInJs: JSON.stringify(req.session.user),
    }

    if(!userPost || !userPost.postedBy){
        res.status(200).render("home", payload);
        return;
    }

    //Try and delete retweet
    var deletedPost = await Post.findOneAndDelete({ postedBy: userId, retweetData: postId })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    var option = deletedPost != null ? "$pull" : "$addToSet";

    var repost = deletedPost;

    if(repost == null)
    {
        repost = await Post.create({ postedBy: userId, retweetData: postId })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
    }

    // Insert/pull user retweet
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { retweets: repost._id } }, { new: true })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    // Insert/pull post retweet
    var post = await Post.findByIdAndUpdate(postId, { [option]: { retweetUsers: userId } }, { new: true })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    // Incrementa numRetweet per il proprietario del post
    if(deletedPost){

        if(sp.shadow && !sp.special){
            await User.findByIdAndUpdate(user._id,  { $inc : {numRetweet : -1, punteggio: -5} } )
            .catch(error => {
                console.log(error);
                res.sendStatus(400);
            })         
        }else if(!sp.special){
            await User.findByIdAndUpdate(userPost.postedBy,  { $inc : {numRetweet : -1, punteggio: -4} } )
            .catch(error => {
                console.log(error);
                res.sendStatus(400);
            })
            await User.findByIdAndUpdate(user._id,  { $inc : {numRetweet : -1, punteggio: -2} } )
            .catch(error => {
                console.log(error);
                res.sendStatus(400);
            })            
        }


    }else{

        if(sp.shadow && !sp.special){
            await User.findByIdAndUpdate(user._id,  { $inc : {numRetweet : 1, punteggio: 5} } )
            .catch(error => {
                console.log(error);
                res.sendStatus(400);
            })
        }else if(!sp.special){
            await User.findByIdAndUpdate(userPost.postedBy,  { $inc : {numRetweet : 1, punteggio: 4} } )
            .catch(error => {
                console.log(error);
                res.sendStatus(400);
            })
            await User.findByIdAndUpdate(user._id,  { $inc : {numRetweet : 1, punteggio: 2} } )
            .catch(error => {
                console.log(error);
                res.sendStatus(400);
            })
        }

    }

    if(!deletedPost)
    {
        await Notification.insertNotification(post.postedBy, userId, "retweet", post._id);
    }

    res.status(200).send(post);
})

router.delete("/:id", (req, res, next) => {
    Post.findByIdAndDelete(req.params.id)
    .then(() => res.sendStatus(202))
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
})

router.put("/:id", async (req, res, next) => {

    //Set all our posts to pinned==false
    //Current allows one pinned post
    if(req.body.pinned !== undefined)
    {
        await Post.updateMany({postedBy: req.session.user }, { pinned: false })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
    }

    Post.findByIdAndUpdate(req.params.id, req.body)
    .then(() => res.sendStatus(204))
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
})

router.delete("/:id", (req, res, next) => {
    Post.findByIdAndDelete(req.params.id)
    .then(() => res.sendStatus(202))
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
})

router.put("/:id", async (req, res, next) => {

    //Set all our posts to pinned==false
    //Current allows one pinned post
    if(req.body.pinned !== undefined)
    {
        await Post.updateMany({postedBy: req.session.user }, { pinned: false })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
    }

    Post.findByIdAndUpdate(req.params.id, req.body)
    .then(() => res.sendStatus(204))
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
})

router.post("/postPicture", upload.single("croppedImage"), async (req, res, next) => {
    if(!req.file) 
    {
        console.log("No file uploaded with ajax request.");
        return res.sendStatus(400);
    }

    var filePath = `/uploads/images/${req.file.filename}.png`;
    var tempPath = req.file.path;
    var targetPath = path.join(__dirname, `../../${filePath}`);

    fs.rename(tempPath, targetPath, async error => {
        if(error != null) 
        {
            console.log(error);
            return res.sendStatus(400);
        }

        await Post.findByIdAndUpdate(req.session.user._id, { postPic: filePath }, { new: true });
        res.sendStatus(204);
    });
});

async function getPosts(filter)
{
    try{
    var results = await Post.find(filter)
    .populate("postedBy")
    .populate("retweetData")
    .populate("replyTo")
    .sort({ "createdAt": -1 }) //Sort by Descending order
    .catch(error => console.log(error))

    results = await User.populate(results, { path: "replyTo.postedBy" });
    return await User.populate(results, { path: "retweetData.postedBy" });
    } catch(error){
        consol.error("Errore caricamento gleet: ", error);
        throw error;
    }
}

module.exports = router;