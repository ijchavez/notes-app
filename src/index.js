require("dotenv").config();
const { listen } = require("./expressApp");
const app = require("./server");
require("./config/database");

listen(app);
//- en new notes estan los errores comentados SCRUM-13
//- en edit notes esta comentado la redireccion a / en vez de /notes SCRUM-35
//- en https://new-notes-app.fly.dev/ agregas una nota vacia y estalla SCRUM-13
