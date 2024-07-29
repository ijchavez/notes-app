const mongoose = require("mongoose");
const { MONGODB_URI } = require("./config");

mongoose
  .connect(MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    //para sortear el deprecation userCreateIndex
    useCreateIndex: true,
  })
  .then((db) => console.log("DB conectada " + db.connection.name))
  .catch((err) => {
    console.log(err);
  });
