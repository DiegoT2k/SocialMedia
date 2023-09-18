const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, required: true },
    bio: { type: String },
    coverPhoto: { type: String },
    likes: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    retweets: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    numLike: {type: Number, default: 0 },
    numRetweet: { type: Number, default: 0 },
    numComment: { type: Number, default: 0 },
    punteggio: { type: Number, default: 0 },
    special: { type: Boolean, default: false },
    shadow: { type: Boolean, default: false}
}, { timestamps: true });

var User = mongoose.model('User', UserSchema);
module.exports = User;