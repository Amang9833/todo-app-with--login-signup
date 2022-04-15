//require of express
const express = require('express');
const app = express();
const port = 5000 || process.env.PORT;

//All Middlewares
app.use(express.json());

//Connection to db
require('./db/conn');

//Routes require 
const auth = require('./routes/auth')
const notes = require('./routes/notes')

//Available Routes
app.use('/api/auth', auth);
app.use('/api/notes', notes);

//listining to port
app.listen(port, () => {
    console.log(`server is running at port ${port}`);
})
