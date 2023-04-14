const mongoose = require('mongoose');

//create a schema for user
const userSchema = new mongoose.Schema({
    firstname:{
        type: String,
        default: null,
    },
    lastname:{
        type: String,
        default: null,
    },
    email:{
        type: String,
        requierd: [true,'Email is Required.'], //if not there show message
        unique: true                        //email is always uique
    },
    password:{
        type: String,
    },
    toekn:{
        type: String,
    },
})

//export the schema. it will be saved in the MongoDB as collection with name "user"
module.exports = mongoose.model("user",userSchema)