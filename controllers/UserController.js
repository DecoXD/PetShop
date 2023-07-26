const jwt = require("jsonwebtoken");
const createUserToken = require("../helpers/create-user-tokens");
const getToken = require("../helpers/getToken");
const User = require("../models/User");
const bcrypt = require('bcrypt');
const getUserByToken = require("../helpers/getUserByToken");
module.exports = class UserController{
    
    static async register(req,res) {
        const{name,email,password,confirmPassword,phone} = req.body;
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
            }
        let image = ''
        if(req.file){
            image = req.file.filename
        }
        userData.image = image
        
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
        //check if input fields has been empty
        if(!email){
            res.status(422).json({message:'email obrigatório'})
            return
        }
        if(!password){
            res.status(422).json({message:'senha obrigatória'})
            return
        }
        //check if user exists
        const user = await User.findOne({email})
        if(!user){
            res.status(422).json({message:"dados incorretos"})
            return
        }   

        
        //check if password match
        const passwordIsCorrect = bcrypt.compareSync(password,user.password)
        if(!passwordIsCorrect){
            res.status(422).json({message:'dados incorretos'})
        }
        await createUserToken(user,req,res)
    }

    static async checkUser(req,res){
        let currentUser = null
        console.log(req.headers.authorization)
        
        if(req.headers.authorization){
            const token = getToken(req);
            const decoded = jwt.verify(token,"nossosecret")
            currentUser = await User.findById(decoded.id)
            currentUser.password = undefined
        }
        res.status(200).send(currentUser)
    }

    static async getUserById(req,res) {
        const {id} = req.params
        const user = await User.findById(id).select("-password")
        if(!user){
            res.status(422).json({message:'usuário nao encontrado'})
            return
        }
        res.status(200).json({user})
    }

    static async editUser(req,res) {
        const {name,email,phone,password,confirmPassword} = req.body;
        
        const {id} = req.params
        //CHECK IF USER EXISTS
        const token = getToken(req)
        const user = getUserByToken(token)
        if(!user)
        {
            res.status(422).json({message:"USUÁRIO NAO ENCONTRADO"})
            return
        }

        
        if(req.file){
            user.image = req.file.filename

        }
        

        if(!name){
            res.status(422).json({message: 'error, o nome é obrigatório'})
            return
        }

        user.name = name
        if(!password){
            res.status(422).json({message: 'error, o password é obrigatório'})
            return
        }

        user.password = password
        if(!confirmPassword){
            res.status(422).json({message: 'error, o confirmPassword é obrigatório'})
            return
        }

        user.confirmPassword= confirmPassword

        //check if email has already taken
        const userExists = await User.findOne({email})
        if(user.email !== email && userExists){
            res.status(422).json({message: 'error, o email é obrigatório'})
            return
        }
        user.email = email

        if(!phone){
            res.status(422).json({message: 'error, o telefone é obrigatório'})
            return
        }

        user.phone = phone
        
        if(password != confirmPassword){
            res.status(422).json({message: "confirme a senha corretamente"})
            return
        }
        else if (password != null){
            const salt = bcrypt.genSaltSync(10)
            const hashPassword = bcrypt.hashSync(password,salt)
            user.password = hashPassword      
        }

        try {
            
            const updatedUser = await  User.findOneAndUpdate(
                {_id: id },
                {$set: user},
                {new: true})
            res.status(200).json({message:'sucesso'})
        } catch (error) {
            res.status(500).json({message:error})
        }
        
    }



}
