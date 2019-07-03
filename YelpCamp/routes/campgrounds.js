var express=require("express");
var router=express.Router();

var Campground   =require("../models/campground");
var middleware   =require("../middleware");
var Review = require("../models/review");
var NodeGeocoder = require('node-geocoder');
var Comment=require("../models/comment"); 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);
// index route, show all campgrounds
router.get("/",function(req,res){ 
    //eval(require("locus"));
    // load all the campgrounds  from database
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({ "name": regex }, function(err, allCampground) {
            if(err) {
                console.log(err);
            } else {
               if(allCampground.length<1){
                   req.flash("error","Campground not found");
                   return res.redirect("back");
               }
               res.render("campgrounds/index", { campgrounds: allCampground, page:"campgrounds" });
            }
        }); 
     
    }
    else{
    Campground.find({},function(err,allCampgronds){
         if(err){
             console.log(err);
         }
         else{
             res.render("campgrounds/index",{campgrounds:allCampgronds});
         }
    });
        }
     
 });
 
 
 //CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var price=req.body.price;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    geocoder.geocode(req.body.location, function (err, data) {
      if (err || !data.length) {
        req.flash('error', 'Invalid address');
        return res.redirect('back');
      }
      var lat = data[0].latitude;
      var lng = data[0].longitude;
      var location = data[0].formattedAddress;
      
      var newCampground = {name: name, price:price,image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
      // Create a new campground and save to DB
      Campground.create(newCampground, function(err, newlyCreated){
          if(err){
              console.log(err);
          } else {
              //redirect back to campgrounds page
              //console.log(newlyCreated);
              res.redirect("/campgrounds");
          }
      });
    });
  });
 
 // new route, create a form to add new campground
 router.get("/new",middleware.isLoggedIn,function(req,res){ // restful route
     
     res.render("campgrounds/new");
 });
 
 // show route, show the info of the campgroud by id
 router.get("/:id", function (req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function (err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

 //Edit campground route
router.get("/:id/edit",middleware.checkCampgroundOnwership,function(req,res){
   
        Campground.findById(req.params.id,function(err,foundCampground){
            res.render("campgrounds/edit",{campground:foundCampground});
               
        
        
    });
    
});
 // UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOnwership, function(req, res){
    geocoder.geocode(req.body.location, function (err, data) {
      if (err || !data.length) {
        console.log(err);
        req.flash('error', 'Invalid address');
        return res.redirect('back');
      }
      req.body.campground.lat = data[0].latitude;
      req.body.campground.lng = data[0].longitude;
      req.body.campground.location = data[0].formattedAddress;
  
      Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
          if(err){
              req.flash("error", err.message);
              res.redirect("back");
          } else {
              req.flash("success","Successfully Updated!");
              res.redirect("/campgrounds/" + campground._id);
          }
      });
    });
  });

 //delete campground
 router.delete("/:id", middleware.checkCampgroundOnwership, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            // deletes all comments associated with the campground
            Comment.remove({"_id": {$in: campground.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/campgrounds");
                }
                // deletes all reviews associated with the campground
                Review.remove({"_id": {$in: campground.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/campgrounds");
                    }
                    //  delete the campground
                    campground.remove();
                    req.flash("success", "Campground deleted successfully!");
                    res.redirect("/campgrounds");
                });
            });
        }
    });
});
 
 function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

 module.exports=router;