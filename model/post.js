const mongoose = require('mongoose')
 const postSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    details:String
 })
 const post = mongoose.model('post', postSchema)
 module.exports = post