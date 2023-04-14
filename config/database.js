const mongoose = require('mongoose');

//URL to connect to mongoDB
const MONGODB_URL = process.env.MONGODB_URL
//export function that can be used in other files to connect the db.
exports.connect = () => {

    //connect to db
    mongoose.connect(MONGODB_URL,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(()=>{
        console.log('DB Connected Succesfully.')
    }).catch((error) => {
        console.log('DB connection failed.')
        console.log(error)

        //exit with failure code 1- failure 0-close after db connect
        process.exit(1)
    })
}