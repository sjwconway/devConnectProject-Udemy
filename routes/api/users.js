const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bycrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");

const User = require("../../models/User");
router.post('/', [
    check("name", "name is required")
        .not()
        .isEmpty(),
    check("email", "please include a valid email").isEmail(),
    check("password", 
    "plese enter a password with 6 or more characters"
    ).isLength({min: 6})

], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }


    const {name, email, password} = req.body;

  

    try {
        let user = await User.findOne({email});

        if(user) {
           return res.status(400).json({ errors: [{msg: "user already exists"}] });
        }

       const avatar = gravatar.url(email, {
           s: "200",
           r: "pg",
           d: "mm"
       }) 

       user = new User({
           name,
           email,
           avatar,
           password
       });

       const salt = await bycrypt.genSalt(10);

       user.password = await bycrypt.hash(password, salt);

       await user.save();

       res.send("User registered");
    } catch(err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }

}
);


module.exports = router;