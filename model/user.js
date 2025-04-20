const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/loginandpost')

const userSchema = mongoose.Schema({
username:String,
email:String,
password:String,
post:[
    {type:mongoose.Schema.Types.ObjectId,
        ref:'post'
    }
]

})
const User = mongoose.model('User',userSchema)
module.exports = User