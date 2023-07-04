const notesCtrl = {};
const Note = require('../models/Note')
const testUser = '64a32b4cb1645f00fa913e73';

notesCtrl.renderNoteForm = (req, res) => {
    res.render('notes/new-note');

}
notesCtrl.createNewNote = async (req, res) => {
    const {title, description}= req.body;
    const newNote = new Note({title, description});

    newNote.user = req.user?.id ?? testUser;
    await newNote.save();
    req.flash('success_msg', 'Note Added Succesfully');
    res.redirect('/notes');

}
notesCtrl.apiCreateNewNote = async (req, res) => {
    const {title, description}= req.body;
    console.log(req.body)
    if (!title || !description) {
        return res.status(400).json(
            { error: 'Se requieren el título y la descripción de la nota.',
              values: { 
                "title":title, 
                "description": description 
            }
        });
    }else{
        const newNote = new Note({title, description});
        newNote.user = req.user?.id ?? testUser;
        await newNote.save();
        res.status(201).json(newNote);
    }

}
notesCtrl.renderNotes = async (req, res) => {
    const notes = await Note.find({user:req.user.id})
                            .sort({createdAt: 'desc'})
                            .lean();
    res.render('notes/all-notes', {notes});

}
notesCtrl.renderEditForm = async (req, res) => {
    const note = await Note.findById(req.params.id).lean();
    console.log(note.user, req.user.id);
    if (note.user != req.user.id){
        req.flash('error_msg', 'Not Authorized');
        return res.redirect('/notes')
        
    }
    res.render('notes/edit-note',{note});

}
notesCtrl.updateNote = async(req, res) => {
    const {title, description} = req.body;
    await Note.findByIdAndUpdate(req.params.id,{title, description});
    req.flash('success_msg', 'Note Updated Succesfully');
    //console.log(req.body);
    res.redirect('/notes')

}
notesCtrl.deleteNote = async (req, res) => {
    await Note.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Note Deleted Succesfully');
    res.redirect('/notes');

}

notesCtrl.allNotes = async (req, res) => {
    const notes = await Note.find({user:req.user?.id ?? testUser})
                            .sort({createdAt: 'desc'})
                            .lean();

    res.json({notes});
    
}
notesCtrl.noteById = async (req, res) => {
    const note = await Note.findById(req.params.id);
    res.json(note);

};
module.exports =  notesCtrl;