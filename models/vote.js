const mongoose = require('mongoose')

const voteSchema=mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },

    votedPerson:{
        type:String,
        required:true
    },

    vote:{
        type:String,
        required:true
    }
})

const VOTE= mongoose.model("vote", voteSchema)
module.exports=VOTE;