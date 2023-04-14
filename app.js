//connect to the db
require('dotenv').config('')
require("./config/database").connect()

//import required modules
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require('cookie-parser');

// //new instance of express
 const app = express();

//customer middleware
const auth = require('./middleware/auth')
//Import create model user

 const user = require("./models/user");

//to prase the incoming req in json format
app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({extended: true}))

 app.get("/",(req,res) => {
     res.send("<H1>Authentication System</H1>");
 })

app.post("/register", async (req,res) => {
    try {
        //collect data
        const {firstname,lastname,email,password} = req.body
        //validate the data
        if (!(email && password && lastname && firstname)){
            //send response with status code
            res.status(402).send("All mandotary fields are not present.")
        }

        //check if user exists in the system with the emailid
        const userstatus = await user.findOne({email})

        //if user exists then send response.
        if (userstatus){
            res.status(402).send("Account exists with the same email. Please use SignIN option.")
        }

        //encrypt the password
        const encryptedPW = await bcrypt.hash(password,10)

        //add entry in the database
        const useregister = await user.create({
            firstname,
            lastname,
            email,
            password:encryptedPW
        });

         //create a token and send it to user, send primary key created through create
         const token = jwt.sign({
            id: user._id,email
        },process.env.secret,{expiresIn: '2h'})


        //do not sent passwrod back to user
        user.password = undefined;

        //send respone
        res.status(201).send(useregister)

    } catch (error) {
        console.log(error)
    }
})

app.post("/login", async (req,res) => {
    try {

        //get email and password
        const {email,password} = req.body;
        
        //validate the data
        if (!(email && password)){
            //send response with status code
            res.status(402).send("All mandotary fields are not present.")
        }

        //check if user is found
        const userfound = await user.findOne({email:email});
        if (userfound){
            //match the password
            const pwmatch = await bcrypt.compare(password,userfound.password)

            //if password matches then send resp
            if (pwmatch) {
               const token = jwt.sign({id: user._id,email},process.env.secret,{expiresIn: '2h'});

               userfound.password = undefined;
               userfound.token = token;

                const options = {
                    expires: new Date(Date.now() + 3*24*60*60*1000),
                    httponly: true
                }
                res.status(200).cookie("token",token,options).json({
                    success:true,
                    token,
                    userfound
                });

            }else{
                //invalid credentials
                res.status(402).send("Invalid credentials.") 
            }

        }
        else{
            //account does not exists.
            res.status(402).send("Please Create a account first.") 
        }
    } catch (error) {
        console.log(error);
    }
})

//dashboard
app.get("/dashboard",auth, async (req,res) => {
   res.send("Welcome to dashboard.")
})
 
 module.exports = app