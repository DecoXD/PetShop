const jwt = require("jsonwebtoken");
const getToken = require("./getToken");



async function verifyToken (req,res,next) {
    if(!req.headers.authorization){
        res.status(401).json({message:'acesso negado'})
        return
    }
    const token = getToken(req);
    if(!token){
        res.status(401).json({message:'acesso negados'})
        return
    }

    try {
        const verified = jwt.verify(token,"nossosecret")
        
        req.user = verified
        next()
    } catch (error) {
        console.log('erro no verify token ', error)
        return res.status(400).json({message:'token invalido'})
    }
}

module.exports = verifyToken