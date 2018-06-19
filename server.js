const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const request = require('request');
const async = require('async');
const expressHbs = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');

const app = express();

app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}))
app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/public'))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(morgan('dev'));

app.use(session({
    resave: true,
    saveUninitialized:true,
    secret:'singco',
    store: new MongoStore({ url:'mongodb://localhost:27017/NewsLetter'})
}));

app.use(flash());

app.route('/')
    .get((req, res) => {
        res.render('main/home', {message: req.flash('success')});
    })
    .post((req, res) => {
       request({
           url: 'https://us16.api.mailchimp.com/3.0/lists/e1e6d0a689/members',
           method: 'POST',
           headers : {
               'Authorization':'randomUser f0225a96234494adc5aec8d9f2e2d37f-us16',
               'Content-Type': 'application/json'
           }, 
           json: {
            'email_address': req.body.email,
            'status': 'subscribed' 
           }
       }, (err, response, body) => {
           if (err) {
                console.log(err);
           }else{
               req.flash('success', 'You have successfully submitted your email');
               res.redirect('/');
           }
       })
    })

app.listen(3000, () => {
    console.log('App is staring at port: 3000')
})