require('dotenv').config();
var express         =require("express"),
    app             =express(),
    bodyParser      =require("body-parser"),
    mongoose        =require("mongoose"),
    Campground      =require("./models/campground"),
    Comment         =require("./models/comment"),
    flash           =require("connect-flash"),
    passport        =require("passport"),
    LocalStrategy   =require("passport-local"),
    User            =require("./models/User"),
    methodOverride  =require("method-override"),
    reviewRoutes     = require("./routes/reviews"),
    seedDB          =require("./seeds");

// requiring route
var campgroundRoute =require("./routes/campgrounds"),
    commentRoute    =require("./routes/comments"),
    indexRoute      =require("./routes/index");


mongoose.connect("mongodb://localhost/yelpcamp_app",{ useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended : true}));
app.set("view engine","ejs");
app.use(express.static(__dirname+"/public")); 
app.use(methodOverride("_method"));
app.use(flash());
//passport configuration
app.use(require("express-session")({
    secret: "it is nice to study",
    resave: false,
    saveUninitialized:false

}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    res.locals.error=req.flash("error");
    res.locals.success=req.flash("success");
    next();
});

app.use("/campgrounds",campgroundRoute);
app.use("/campgrounds/:id/comments",commentRoute);
app.use("/",indexRoute);
app.use("/campgrounds/:id/reviews", reviewRoutes)

app.locals.moment = require('moment');



app.listen(8085,function(){
    console.log("The YelpCamp Sever Has Started!");
})