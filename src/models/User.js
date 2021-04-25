const {Schema, model} = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({ 
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    
    },
    password: {
        type: String,
        required: true
    
    }
},{
    timestamp: true

});

//CIFRADO
UserSchema.methods.encryptPassword = async password => {
    const salt = await bcrypt.genSalt(10);
    const bcryptedPassword = await bcrypt.hash(password, salt);
    return bcryptedPassword;

}
UserSchema.methods.matchPassword = async function(password){
    const compare = await bcrypt.compare(password, this.password);
    return compare;

}

module.exports = model('User', UserSchema);
