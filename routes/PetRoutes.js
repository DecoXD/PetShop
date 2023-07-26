const express = require('express');
const PetController = require('../controllers/PetController');
const router = express.Router();

// MIDDLEWARES
const verifyToken = require('../helpers/verifyToken');
const { imageUpload } = require('../helpers/imageUpload');

//post routes
router.post('/create',verifyToken,imageUpload.array('images'),PetController.create)


//get routes
router.get('/',PetController.getAll)
router.get('/mypets',verifyToken,PetController.getAllUserPets)
router.get('/myadoptions',verifyToken,PetController.getAllUserAdoptions)
router.get('/:id',PetController.getPetById)

//delete routes
router.delete('/:id',verifyToken,PetController.removePetById)

//patch routes
router.patch('/:id',verifyToken,imageUpload.array('images'), PetController.updatePet)
router.patch('/schedule/:id',verifyToken, PetController.schedule)
router.patch('/conclude/:id',verifyToken, PetController.concludeAdoption)

module.exports = router