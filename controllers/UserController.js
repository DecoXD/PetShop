const createUserToken = require("../helpers/create-user-tokens");
const User = require("../models/User");
const bcrypt = require('bcrypt');
module.exports = class UserController{
    
    static async register(req,res) {
        const{name,email,password,confirmPassword,phone,image} = req.body;
        if(!name){
            res.status(422).json({message: 'error, o nome é obrigatório'})
            return
        }
        if(!password){
            res.status(422).json({message: 'error, o password é obrigatório'})
            return
        }
        if(!confirmPassword){
            res.status(422).json({message: 'error, o confirmPassword é obrigatório'})
            return
        }
        if(!email){
            res.status(422).json({message: 'error, o email é obrigatório'})
            return
        }
        
        if(!phone){
            res.status(422).json({message: 'error, o telefone é obrigatório'})
            return
        }

        if(password != confirmPassword){
            res.status(422).json({message: "confirme a senha corretamente"})
            return
        }

        //check if user exists
        const userExists = await User.findOne({email})
        if(userExists){
            res.status(422).json({message:'por favor utilize outro email!'})
            return
        }
        //crypt the password
        const salt = bcrypt.genSaltSync(10)
        const hashPassword = bcrypt.hashSync(password,salt)

        const userData = {
            name,
            email,
            password:hashPassword,
            phone,
            image}
        const user = new User(userData) 
        try {
            const newUser = await user.save()
            await createUserToken(newUser,req,res)         
        } catch (error) {
            res.status(500).jaon({message: error.message})
        }
        
       
    }

    static async login(req,res) {
        const {email,password} = req.body;
        if(!email){
            res.status(422).json({message:'email obrigatório'})
            return
        }
        if(!password){
            res.status(422).json({message:'senha obrigatória'})
            return
        }
        
        res.status(200).json({message:'passou'})
    }
}