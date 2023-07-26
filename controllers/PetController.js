const getToken = require("../helpers/getToken");
const getUserByToken = require("../helpers/getUserByToken");
const Pet = require("../models/Pet");
const {ObjectId} = require('mongoose').Types
module.exports = class PetController{

    static async create (req,res) {
        const {name,age,weight,color} = req.body;
        let available = true;
        const images = req.files
        //upload de images
        console.log(age)
        //validations
      if(!name){
        res.status(422).json({message:'nome obrigatorio'})
        return
      }
      if(!age){
        res.status(422).json({message:'idade obrigatoria'})
        return
      }
      if(!weight){
        res.status(422).json({message:'peso obrigatorio'})
        return
      }
      if(!color){
        res.status(422).json({message:'cor obrigatoria'})
        return
      }
      if(images.length == 0){
        res.status(422).json({message:'a imagem é obrigatoria'})
        return
      }

      
      //get pet owner

      const token = await  getToken(req)
      const user = await getUserByToken(token)
      console.log(user)
    
      const pet = new Pet({
        name,
        age,
        weight,
        color,
        available,
        images:[],
        user:{
            _id : user.id,
            name: user.name,
            image:user.image,
            phone:user.phone
        }
      })

      images.map((image) => {
        pet.images.push(image.filename)
      })

      try {
        const newPet = await pet.save()
        res.status(201).json({message:'pet cadastrado com sucesso'})
        
      } catch (error) {
        res.status(500).json({message:error})
      }
    }

    static async getAll(req,res){
      const pets = await Pet.find().sort('-createdAt');
      res.status(200).json({message:'tudo ok '})

    }

    static async getAllUserPets(req , res) {
      //get user from token
      const token = await getToken(req)
      
      const user = await getUserByToken(token)
      
      const pets = await Pet.find({'user._id':user._id}).sort('-createdAt')
      res.status(200).json({message: 'ocorreu td bem', user})
    }

    static async getAllUserAdoptions(req , res) {
      //get user from token
      const token = await  getToken(req);
      const user = await  getUserByToken(token)
  
      const pets = await Pet.find({'adopter._id': user._id}).sort('-createdAt')
      res.status(200).json({message:'olá mundo', pets})
    }

    static async getPetById(req,res) {
      const {id} = req.params;
      if(!ObjectId.isValid(id)){
        res.status(422).json({message:'id inválido'})
        return
      }
      //check if pet exists
      const pet = await Pet.findOne({_id:id})

      console.log(pet)

      if(!pet){
        res.status(404).json({message:'pet invalido'})
        return
      }

      res.status(200).json({message:'deu certo po'})
      return
    }

    static async removePetById(req, res) {
      const {id} = req.params;
      if(!ObjectId.isValid(id)){
        res.status(422).json({message:'id invalido po'})
        return
      }
      //check if id is valid
      const pet = await Pet.findOne({_id: id});
       if(!pet){
        res.status(422).json('pet invalido');
        return
       }

       //check if logged user registered the pet

       const token = await getToken(req)
       const user = await getUserByToken(token)

       const isPetOwner = pet.user._id == user._id;

       console.log(isPetOwner)
    
       if(!isPetOwner){
        res.status(422).json({message:'você nao é o dono do pet'})
        return
       }

       
       await Pet.findByIdAndRemove(id)
       res.status(200).json({message:'ok deletei aq po'})

       
    }

    static async updatePet(req, res) {
      const {id} = req.params

      const {name,age,weight,color,available} = req.body;

      

      const images = req.files

      const updatedData = {}

      //check if all fields are preenched
      if(!name){
        res.status(422).json({message:'nome obrigatorio'})
        return
      }else{
        updatedData.name = name
      }

      if(!age){
        res.status(422).json({message:'idade obrigatoria'})
        return
      }else{
        updatedData.age = age
      }

      if(!weight){
        res.status(422).json({message:'peso obrigatorio'})
        return
      }else{
        updatedData.weight = weight
      }

      if(!color){
        res.status(422).json({message:'cor obrigatoria'})
        return
      }else{
        updatedData.color = color
      }
      if(images.length === 0){
        res.status(422).json({message:'a imagem é obrigatoria'})
        return
      }else{
        updatedData.images = []
        images.map((image) => updatedData.images.push(image.filename))
      }



      //check if pet exists
      const pet = await Pet.findOne({_id:id})
      if(!pet){
        res.status(422).json({message:'pet invalido'})
        return
      }
      //check if user é o dono
      const token = getToken(req)
      const user = await getUserByToken(token)

      const isPetOwner = pet.user._id == user._id;
      if(!isPetOwner){
        res.status(404).json({message:'você nao é o dono'})
        return
      }

      await Pet.findByIdAndUpdate(id,updatedData)

      res.status(200).json({message:'pet upado com sucesso'})
      


    }

    static async schedule (req, res) {
      const {id} = req.params;

      if(!ObjectId.isValid(id)){
        res.status(422).json({message:'id invalido'})
        return
      }

      //check if pet exists

      const pet = await  Pet.findOne({_id:id})
      if(!pet){
        res.status(422).json({message:'pet não existe'})
        return

      }

      //check if user registered the pet

      const token = getToken(req);
      const user = await getUserByToken(token)
      
      const isPetOwner = pet.user._id == user._id;
      // pet.user._id.equals(user._id)

      //i dont schedule adoption from my own pet
      if(isPetOwner){
        res.status(422).json({message:'o pet é seu mano'})
        return
      }

      //check if has scheduled a visit

      if(pet.adopter){
        if(pet.adopter._id.equals(user._id)){
          res.status(422).json({message:'você ja agendou uma visita'})
          return
        }

      }

      //add user to pet

      pet.adopter = {
        _id : user._id,
        name : user.name,
        image: user.image
      }
  
      await Pet.findByIdAndUpdate(id,pet)

      res.status(200).json(
        {message:`pet adotado com sucesso, entre em contato com ${pet.user.name} pelo telefone ${pet.user.phone}`})
        return
    } 

    static async concludeAdoption(req,res) {
      const {id} = req.params;

      const pet = await Pet.findOne({_id: id});
      
      if(!pet){
        res.status(422).json({message:' pet invalido'})
        return
      }

      const token = getToken(req)
      const user = await getUserByToken(token)

      const isPetOwner = pet.user._id == user._id

      if(!isPetOwner){
        res.status(422).json({message:'ocorreu algum erro'})
        return
      }

      pet.available = false

      await Pet.findByIdAndUpdate(id,pet)

      res.status(200).json({message:'parabens, o ciclo de adoção foi finalizado com sucesso'})
    }
}