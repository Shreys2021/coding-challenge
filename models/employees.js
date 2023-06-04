const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const employeeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    officeLoc: {
        type: String,
        required: true
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    owner: {

        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model('Employee', employeeSchema);


