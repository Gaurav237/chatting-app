const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const asyncHandler = require('express-async-handler')

const protect = asyncHandler(async(req, res, next) => {
    let token;

    if(
        req.headers.authorization && 
        req.headers.authorization.startsWith("Bearer")
    ){
        try {
            // token = Bearer dsfafid324223cds
            token = req.headers.authorization.split(' ')[1];

            // decodes token id
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // find and return the user without the password, into req.body
            req.user = await User.findById(decoded.id).select('-password');
            
            next();
        }catch(err) {
            res.status(401);
            throw new Error('Not authorized, no token present');
        }
    }

    if(!token) {
        res.status(401);
        throw new Error('Not authorized, no token present');
    }
});

module.exports = protect;