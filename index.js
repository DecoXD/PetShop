const express = require('express');
const cors = require('cors');
const app = express()
const conn = require('./db/conn')
//config json response
app.use(express.urlencoded({extends:true}))
app.use(express.json())
//solve cors
app.use(cors({credentials:true, origin:'http://localhost:3000'}))
//routers
const UserRouter = require('./routes/UserRouter')

//Public folder for images
app.use(express.static('public'))

//routes
app.use('/',UserRouter)

app.listen(5000)