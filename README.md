# Social Media Web-App inspired by Twitter
A social media website written with Node.JS, MongoDB and Socket.IO

# Features

- Tweets
- Likes, comments, and retweets
- Profile pages
- Following and followers
- Real-time Instant Messaging (Socket.IO)
- Real-time notifications (Socket.IO)
- Profile pictures
- Cover photos

# Install Instructions

    $ cd Downloads
    $ git clone https://github.com/safesploit/TwitterClone.git
    $ cd TwitterClone
    # apt install npm && node
    $ npm install 
    $ node start app.js


This will initalise a web server using Express hosting the web-app at http://localhost:3003/

## Security Notice

This web-app is **NOT** secure and therefore should not hosted on an untrusted network or host any sensitive data.

A notable security bug, which was done _intentionally_ for making development easier: 
https://github.com/safesploit/TwitterClone/blob/9827da8e5878ff36312eafd007d4e87af16919b4/app.js#L74

Which is not the only occurance of allowing the server-side to pass _full database queries_ to the client-side.
During development this allowed for easier client-side manipulation of data without having to plan.