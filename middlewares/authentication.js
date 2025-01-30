const {verifyToken}= require('../services/auth')
// const {generateKeyPair}= require('../services/key')

function checkIfCookieExists(cookieName){
    return(req,res,next)=>{
        const token=req.cookies[cookieName];
        if(!token) return next()

        try{
            const payLoad= verifyToken(token)
            // generateKeyPair(payLoad.fullName)
            req.user=payLoad
        }
        catch(err){
            console.log(err);
        }

        return next();
    }
}

module.exports={checkIfCookieExists}