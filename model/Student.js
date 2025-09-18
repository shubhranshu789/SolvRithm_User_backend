const mongoose = require('mongoose');


const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    Member1: {
        type: String,
        require: true
    },
    Member2: {
        type: String,
        // require:true
    },
    Member3: {
        type: String,
        // require:true
    },
    Member4: {
        type: String,
        // require:true
    },
    email: {
        type: String,
        require: true
    },
    uniRoll: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    //add IP
    ip: {
        type: String,
        require: true
    },
    projects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PROJECT",
        }
    ]
})



mongoose.model("STUDENT", studentSchema)