const UserController = require("../controllers/UserController");
const express = require('express');
const router = express.Router();

//midlewares
const verifyToken = require("../helpers/verifyToken");
//upload images
const { imageUpload } = require("../helpers/imageUpload");


router.post('/register',UserController.register)
router.post('/login',UserController.login)

//get Routes
router.get('/checkuser',UserController.checkUser)
router.get('/:id', UserController.getUserById)
router.patch('/edit/:id',
verifyToken,
imageUpload.single('image'), 
UserController.editUser)
module.exports = router