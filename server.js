// Require Package
const express = require("express");
const app = express();
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
//Mongoose Database
mongoose.connect('mongodb://localhost:27017/messageDB', { useNewUrlParser: true, useUnifiedTopology: true });
const commentSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Should not be a blank"], minlength: 1 },
    comment: { type: String, required: [true, "Should not be a blank"], minlength: 1 }
})
const messageSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Should not be a blank"], minlength: 1 },
    message: { type: String, required: [true, "Should not be a blank"], minlength: 1 },
    comments: [commentSchema]
}, { timestamps: true })

const Comment = mongoose.model("Comment", commentSchema);
const Message = mongoose.model("Message", messageSchema);

//EJS and Staic Content
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

//Flash
const flash = require('express-flash');
app.use(flash());

//Session Setup
const session = require('express-session');
app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

//Get and Post request

app.get("/", function (req, res) {
    Message.find()
        .then(mes => res.render("index", {msgs: mes }))
        .catch(err => res.json(err));

})

app.post('/message/new', function (req, res) {
    Message.create(req.body)
        .then(newMessage => {
            console.log(newMessage);
            res.redirect("/")
        })
        .catch(err => {
            console.log("We have an error!", err);
            for (var key in err.errors) {
                req.flash('registration', err.errors[key].message);
            }
            res.redirect('/');
        });
})

app.post('/comment/new/:id', function (req, res) {
    Comment.create(req.body)

        .then(newComment => {
            console.log(newComment);
            Message.findOneAndUpdate(
                { _id: req.params.id },
                { $push: { comments: newComment } },
                (err2, data2) => {
                    if (err2) {
                        console.log(err2);
                    }
                    else {
                        console.log(data2);
                        res.redirect("/");
                    }
                }
            );
            })
        
        .catch (err => {
        console.log("We have an error!", err);
        for (var key in err.errors) {
            req.flash('registration', err.errors[key].message);
        }
        res.redirect('/');
    });
})

app.listen(8000, function () {
    console.log("Server is running on port 8000");
});

