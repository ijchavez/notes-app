require("dotenv").config();
const { listen } = require("./expressApp");
const app = require("./server");
require("./config/database");

listen(app);
/**
 * en https://blue-darkness-3197.fly.dev/
 *     estan los errores duplicados SCRUM-13
 *     edit notes esta comentado la redireccion a / en vez de /notes SCRUM-35
 *     edit notes al salvar no hace nada
 *     logout no funciona
 *     404 no muestra mensaje intuitivo
 * */
//- en https://blue-darkness-3197.fly.dev/ estan los errores comentados SCRUM-13
//- en https://blue-darkness-3197.fly.dev/ edit notes esta comentado la redireccion a / en vez de /notes SCRUM-35
//- en https://new-notes-app.fly.dev/ agregas una nota vacia y estalla SCRUM-13
