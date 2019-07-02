var express     =require("express");
var router      =express.Router({mergeParams:true});

var Comment      =require("../models/comment"),
    Campground   =require("../models/campground"),
    middleware   =require("../middleware"); 
// comment route
router.get("/new", middleware.isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err);
        }
        else{
            res.render("comments/new",{campground:campground});
        }
    });
    


});
// add new comment
router.post("/", middleware.isLoggedIn,function(req,res){
    // look up the campground by id
    Campground.findById(req.params.id,function(err,campgroud){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }
        else{
            Comment.create(req.body.comment,function(err,comment){
                if(err){
                    req.flash("error","Something went wrong");
                    console.log(err);
                }
                else{
                    comment.author.id=req.user._id;
                    comment.author.username=req.user.username;
                    comment.save();
                    campgroud.comments.push(comment);
                    campgroud.save();
                    req.flash("success","Successfully added new comment");
                    res.redirect("/campgrounds/"+campgroud._id);
                }
            })
        }
    });
   
});
// comment edit route
router.get("/:comment_id/edit", middleware.checkCommentOnwership,function(req,res){
    Comment.findById(req.params.comment_id, function(err,foundComment){
            if(err){
                console.log(err);
                res.redirect("back");
            }
            else{
                res.render("comments/edit",{campground_id: req.params.id, comment: foundComment});
            }
    });
});

//comment update
router.put("/:comment_id", middleware.checkCommentOnwership,function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
        if(err){
            console.log(err);
            res.redirect("back");
        }
        else{
            req.flash("success","Successfully updated new comment");
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

//comment delete route
router.delete("/:comment_id", middleware.checkCommentOnwership,function(req,res){
    //find by id
    Comment.findByIdAndRemove(req.params.comment_id,function(err){
        if(err){
            console.log(err);
            res.redirect("back");
        }
        else{
            req.flash("success","Successfully deleted new comment");
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
    //remove
})

module.exports= router;