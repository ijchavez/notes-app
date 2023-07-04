const {Router} = require('express');
const router = Router();

const {renderNoteForm,
       createNewNote,
       renderNotes,
       renderEditForm,
       updateNote,
       deleteNote,
       allNotes,
       apiCreateNewNote,
       noteById
} = require('../controllers/notes.controller');

const {isAuthenticated, isApiAuthenticated} = require('../helpers/auth');

router.get('/notes/add', isAuthenticated, renderNoteForm)

router.post('/notes/new-note', isAuthenticated, createNewNote);

router.get('/notes', isAuthenticated, renderNotes);

router.get('/notes/edit/:id', isAuthenticated, renderEditForm);

router.put('/notes/edit/:id', isAuthenticated, updateNote);

router.delete('/notes/delete/:id', isAuthenticated, deleteNote)

router.post('/api/notes/new-note', isApiAuthenticated, apiCreateNewNote);

router.get('/api/notes/all', allNotes);

router.get('/api/notes/:id', noteById);
module.exports = router;