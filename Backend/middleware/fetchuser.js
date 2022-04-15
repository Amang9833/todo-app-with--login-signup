const jwt = require('jsonwebtoken');
const JWT_SECRET = "amanisagoodboy$"; 


const fetchuser = (req, res, next) => {
    //get the user from jwt token and add id to req object
    const token = req.header('auth-token');
    if (!token)
    {
       return res.status(401).send({ error: "Pleazw authenticate using a valid token" });

    }
    try {
        const data = jwt.verify(token , JWT_SECRET)
        req.user = data.user;
        next();
        
    } catch (err) {
        res.status(401).send('invalid token')
    }
}

module.exports = fetchuser;