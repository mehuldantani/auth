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

 const User = require("./models/user");

//to prase the incoming req in json format
app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.get("/",(req,res) => {
     return res.send("<H1>Authentication System</H1>");
 })

app.post("/register", async (req,res) => {
    try {
        //collect data
        const {firstname,lastname,email,password} = req.body
        //validate the data
        if (!(email && password && lastname && firstname)){
            //send response with status code
            return res.status(402).send("All mandotary fields are not present.")
        }

        //check if user exists in the system with the emailid
        const userstatus = await User.findOne({email})

        //if user exists then send response.
        if (userstatus){
            return res.status(402).send("Account exists with the same email. Please use SignIN option.")
        }

        //encrypt the password
        const encryptedPW = await bcrypt.hash(password,10)

        //add entry in the database
        const useregister = await User.create({
            firstname,
            lastname,
            email,
            password:encryptedPW
        });

         //create a token and send it to user, send primary key created through create
         const token = jwt.sign({
            id: useregister._id,email
        },process.env.SECRET,{expiresIn: '2h'})


        //do not sent passwrod back to user
        useregister.password = undefined;
        useregister.token = token;
        //send respone
        return res.status(201).send(useregister)

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
            return res.status(402).send("All mandotary fields are not present.")
        }

        //check if user is found
        const userfound = await User.findOne({email:email});
        if (userfound){
            //match the password
            const pwmatch = await bcrypt.compare(password,userfound.password)

            //if password matches then send resp
            if (pwmatch) {
               const token = jwt.sign({id: userfound._id,email},process.env.SECRET,{expiresIn: '2h'});

               userfound.password = undefined;
               userfound.token = token;

                const options = {
                    expires: new Date(Date.now() + 3*24*60*60*1000),
                    httponly: true
                }
                return res.status(200).cookie("token",token,options).json({
                    success:true,
                    token,
                    userfound
                });

            }else{
                //invalid credentials
                return res.status(402).send("Invalid credentials.") 
            }

        }
        else{
            //account does not exists.
            return res.status(402).send("Please Create a account first.") 
        }
    } catch (error) {
        console.log(error);
    }
})

//dashboard
app.get("/dashboard",auth, async (req,res) => {
   return res.send("Welcome to dashboard.")
})

// Handle invalid routes
app.use((req, res) => {
  return res.status(404).send('<H2>Page not found.</H2>');
});

 module.exports = app