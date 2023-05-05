const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: { type: String, required: true, trim: true },
    //lastName: { type: String, required: false, trim: true },
    username: { type: String, required: true, trim: true, unique: true },
    //email: { type: String, required: false, trim: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, required: true },
    coverPhoto: { type: String },
    likes: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    retweets: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    numLike: {type: Number, default: 0},
    numRetweet: {type: Number, default: 0},
    punteggio: {type: Number, default: 0}
}, { timestamps: true });

var User = mongoose.model('User', UserSchema);
module.exports = User;