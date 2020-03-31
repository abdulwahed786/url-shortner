var express = require("express");
var app = express();

var cors = require("cors");
app.use(cors({ optionSuccessStatus: 200 }));

var bodyParser = require("body-parser");
app.use(bodyParser.json());

var dns = require('dns');

const mongoose = require("mongoose");
//Retrieves the template/model for shortUrl schema
const shortUrlModel = require('./models/urlshortner-schema');

// connecting to db
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/shortUrls", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
//shortUrls (added s ) because mongoose pluralizes it

app.use(express.static(__dirname + "/public"));

app.get("/new/:urlToShorten(*)", (req, res, next) => {
    console.log(req.params.urlToShorten);

    //ES5// var urlToShorten = req.params.urlToShorten;
    var { urlToShorten } = req.params;
    // res.json({urlToShorten});
    var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    var regex = expression;

    if (regex.test(urlToShorten)) {
        var short = Math.floor(Math.random() * 1000000).toString();
        // console.log(short);
        //Create object to send to the database
        var data = new shortUrlModel({
            originalUrl: urlToShorten,
            shorterUrl: short
        });
        
        //Saves to database and throws error message if it fails
        data.save(err => {
            if (err) {
                return res.send("Error saving to database");
            }
        });
        return res.json(data);
    }
    else {
        res.json({"error":"invalid URL"}); 
    }
    // var data = new shortUrl({
    //     originalUrl: "urlToShorten",
    //     shorterUrl: "Invalid URL"
    // });
    // return res.json(data);
});

app.get('/:urlToFwd',(req,res,next)=>{
 
    var shorterUrl = req.params.urlToFwd;

    shortUrlModel.findOne( {'shorterUrl': shorterUrl}, (err,data)=>{
        if(err){
            return res.send("error with the shortend url cannot find in DB");
        }
        var re = RegExp("^(http | https)://","i");
        console.log(data);
        var strToCheck = data.originalUrl;
        if( re.test(strToCheck)){
            dns.lookup(strToCheck, function (err, addresses, family) {
                if(err)
                   res.json({"error":"invalid URL"});
                  console.log(addresses);
                });
            res.redirect(301,strToCheck);
        }
        else{
            res.redirect(strToCheck);
        }

        // HINT: to be sure that the submitted url points to a valid site 
        // you can use the function dns.lookup(host, cb) from the dns core module.
    });

    

});

var listener = app.listen(process.env.PORT || 3000, function () {
    console.log("Your app is listening on port " + listener.address().port);
});
