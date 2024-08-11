const { Router } = require("express");
const router = Router();
const { isApiAuthenticated } = require("../../helpers/auth");
const {
  apiCreateNewNote,
  apiAllNotes,
  apiNoteById,
  apiUpdateNote,
  apiDeleteNote,
} = require("../../controllers/api/notes.api.controller");

router.post("/new-note", isApiAuthenticated, apiCreateNewNote);
router.get("/all", isApiAuthenticated, apiAllNotes);
router.get("/:id", isApiAuthenticated, apiNoteById);
router.put("/edit/:id", isApiAuthenticated, apiUpdateNote);
router.delete("/delete/:id", isApiAuthenticated, apiDeleteNote);

module.exports = router;
