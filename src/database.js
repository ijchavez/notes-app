const mongoose = require('mongoose');
//const NOTES_APP_MONGODB_HOST = process.env.NOTES_APP_MONGODB_HOST
//const NOTES_APP_MONGODB_DATABASE = process.env.NOTES_APP_MONGODB_DATABASE
//suplanto lo de arriba por lo de abajo
const {NOTES_APP_MONGODB_HOST, NOTES_APP_MONGODB_DATABASE } = process.env;
const MONGODB_URI= `mongodb://${NOTES_APP_MONGODB_HOST}/${NOTES_APP_MONGODB_DATABASE}`

mongoose.connect(MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    //para sortear el deprecation userCreateIndex
    useCreateIndex : true

})
//promesas para ver si la base conecta
  .then(db => console.log('DB conectada'))
  .catch(err => {console.log(err)});