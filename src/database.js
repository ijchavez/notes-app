const mongoose = require('mongoose');
//const NOTES_APP_MONGODB_HOST = process.env.NOTES_APP_MONGODB_HOST
//const NOTES_APP_MONGODB_DATABASE = process.env.NOTES_APP_MONGODB_DATABASE
//suplanto lo de arriba por lo de abajo
const {NOTES_APP_MONGODB_HOST, NOTES_APP_MONGODB_DATABASE } = process.env;
const MONGODB_URI= `mongodb+srv://admin:Zz.1121224421@cluster0.haqjg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

mongoose.connect(MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    //para sortear el deprecation userCreateIndex
    useCreateIndex : true

})
//promesas para ver si la base conecta
  .then(db => console.log('DB conectada'))
  .catch(err => {console.log(err)});

  /***********************
   * como leer la base de datos:
   * > show databases
      admin      0.000GB
      config     0.000GB
      local      0.000GB
      notes-app  0.000GB
      > use notes-app
      switched to db notes-app
      > db.users.find()
      { "_id" : ObjectId("608470dab7b7470b9adafb27"), "name" : "Gerardo Chavez", "email" : "info.gerardo.chavez@gmail.com", "password" : "$2a$10$ApaMZmVNqYICqxuXo23jUe.WobVbPhEI7Gk3q5lEEtJbiS5ud0M1C", "__v" : 0 }
      { "_id" : ObjectId("60848ff04bac4af1b0778670"), "name" : "asd", "email" : "asd@asd", "password" : "$2a$10$GxcPUZ2FNwBrqIgz0hVLHeGQ1WFLNt0becktPwFMgV95Y6OmJX/Jq", "__v" : 0 }
      { "_id" : ObjectId("60849467ec54201a50ca2602"), "name" : "Gerardo Chavez", "email" : "chavez_gerardo@redlink.com", "password" : "$2a$10$nhn.8ZhvvZH8OAdemeefKeOI6fV2X2kV.50nBbC/SY5qqnhrp2otC", "__v" : 0 }

   * 
   */