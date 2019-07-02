var mongoose=require("mongoose");

var campgroundSchema=new mongoose.Schema({
    name:String,
    price:String,
    image:String,
    description:String,
    location: String,
    lat: Number,
    lng: Number,
    createAt:  {type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        username: String
    },
    comments:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    rating: {
        type: Number,
        default: 0
    }
});
var Campground=mongoose.model("Camground",campgroundSchema);
module.exports=Campground;