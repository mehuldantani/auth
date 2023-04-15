const jwt = require('jsonwebtoken')

const auth = (req,res,next) => {
    console.log(req.cookies);

    //get token from the client cookies
    const token = req.cookies.token;

    //inform user if token is not present,happens when cookies are cleared
    if (!token){
        res.status(403).send("Token Missing.")
    }

    try {
        const decodedtoken = jwt.verify(token,process.env.SECRET)
        //this will generate the raw data from which the token was generated using sing method
        req.user = decodedtoken;
        
    } catch (error) {
        res.status(403).send('Token is Invalid.')
    }

    next();

}

module.exports = auth;
