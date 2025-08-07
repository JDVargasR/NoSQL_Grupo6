const mongoose = require("mongoose");

const recomendacionesSchema = new mongoose.Schema({ 
recomendacion: {type: String, required: true, maxlength: 300},
 id_estado: {type: Number, default: 1, required: false }
 });

module.exports = mongoose.model("Recomendaciones", recomendacionesSchema);


