const jwt= require('jsonwebtoken')
const secret= "Secure"

function createTokens(user){
    const payLoad={
        _id:user._id,
        fullName:user.fullName,
        email:user.email,
        role:user.role
    };

    const token = jwt.sign(payLoad, secret);

    return token;
}

function verifyToken(token){
    const payLoad=jwt.verify(token, secret);
    return payLoad;
}

module.exports={createTokens, verifyToken};