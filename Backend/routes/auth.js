const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const saltRounds = 10;
const JWT_SECRET = 'amanisagoodboy$'; 
const fetchuser = require('../middleware/fetchuser')

//ROUTE => 1 : Create a user using: Post '/api/auth/createuser' . Doesn`t require Auth
router.post(  
  "/createuser",                                                                              //for endpoint user registertion
  [
                                                                                               //for validation
    body("email", "Enter a valid Email").isEmail(),
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("password", "password size should be greater then 5").isLength({min : 5}),
  ],
  async (req, res) => {                                                                         //for request and respone
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let user = await User.findOne({ email: req.body.email });
    if (user) {                                                                                  // to validate user
      return res.status(400).json({ error: "Sorry User already exist" });
    }
                                                                                              //hashed password genration
    const myPlaintextPassword = req.body.password;
    const hashedPassword = await bcrypt.hash(myPlaintextPassword, saltRounds);                // to hashed password

    try {                                                                                     //to create user
      const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      });

      const data = {
        user: {
          id: newUser.id
        }
      }
      const authtoken = jwt.sign(data, JWT_SECRET);
      res.status(200).send({authtoken});
      // res.json(newUser);
    }
    catch (err) {                                                                         //for error
      console.log("error to save user to data base boss" + err.message);
      res.status(500).send("internal server error some error occured");
    }
  }
);

//ROUTE => 2 : authenticate  a user using: Post '/api/auth/login' no  login required
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'password cannot be blank').exists(),
], async (req, res) => {
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
  }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "plz try to login with correct credencail" });
      }
      const passwordCompare = await bcrypt.compare(req.body.password, user.password); //to compare password
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ error: "plz try to login with correct credencail" });
      }
 // auth the user
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      res.status(200).json({ authtoken });

    } catch (err) {
      //for error
      console.log(err.message);
      res.status(500).send('internal server error some error occured');
    }
  
});

  // ROUTE => 3 : GET LOGGEDIN user details using : POST "/api/auth/getuser" .login required
router.post('/getuser',fetchuser , async (req, res) => {
    
  try {
    const userId =  req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user)
  } catch (err) {
    //for error
    console.log(err.message);
    res.status(500).send("internal server error some error occured");
  }
})
  module.exports = router;
