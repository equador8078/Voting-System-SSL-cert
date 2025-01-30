const mongoose=require('mongoose')
const {createTokens, verifyToken}= require('../services/auth')
const { createHmac,randomBytes } = require('crypto');
const Roles={
    USER:'user',
    ADMIN:'ADMIN'
}
const userSchema =mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        require:true
    },
    salt:{
        type:String
    },
    password:{
        type:String,
        required:true
    },
    publicKey:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:Object.values(Roles),
        default:Roles.USER
    }
})

userSchema.pre('save',function (next){
    const user=this;

    if(!user.isModified('password')) return;

    const salt=randomBytes(16).toString('hex');
    const hashedPassword=createHmac('sha256',salt)
    .update(user.password)
    .digest('hex')

    this.salt=salt;
    this.password=hashedPassword;

    next()
})

userSchema.statics.matchPasswordAndCreateToken=async function(email, password){
    const  user=await this.findOne({email})
    if(!user) throw new Error("User not found")

        const salt = user.salt;
        const hashedPassword=user.password

        const userProvidedHash=createHmac('sha256',salt)
        .update(password)
        .digest('hex')

        if(hashedPassword!==userProvidedHash) throw new Error("Password not matched")

            const token =createTokens(user)
            return token;
}

const USER= mongoose.model("user", userSchema)

module.exports=USER