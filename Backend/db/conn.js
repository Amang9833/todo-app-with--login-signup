const mongoose = require('mongoose');
const MONGO_URI =
  "mongodb://localhost:27017/inootbook";

const connTOMongo = async () => {
    try {
       await  mongoose.connect(MONGO_URI);
    console.log('backend connected :)');
    }
    catch (err)
    {
        console.log('error');
    }
    
}


connTOMongo();
