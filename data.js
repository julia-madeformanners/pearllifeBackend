const mongoose = require('mongoose');


const users = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    date: {
        type: String,
        default: () => {
            const d = new Date();
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0'); 
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        }
    },
    amount: Number,
    firstOptionValue: Number,
    secondOptionValue: Number,
    extraValue: Number

}, { timestamps: true });




const User = mongoose.model('User', users);


module.exports = { User };
