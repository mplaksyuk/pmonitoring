const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new mongoose.Schema({
    firstname: {type: String},
    lastname: {type: String},
    position: {type: String}
});

const tasksSchema = new mongoose.Schema({
    title:{type: String},
    description:{type: String},
    users:{type:[userSchema]}
});

const taskSchema = new mongoose.Schema({ 
    
    title:{
        type: String,
    },
    tasks:{
        type: [tasksSchema]
    },
    
});

module.export = mongoose.model("taskSchema", taskSchema);