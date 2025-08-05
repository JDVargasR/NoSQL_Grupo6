const mongoose = require("mongoose");

const recomendacionesSchema = new mongoose.Schema({ 
recomendacion: {type: String, required: true, maxlength: 300},
 id_estado: {type: Number, required: true }
 });

module.exports = mongoose.model("Recomendaciones", recomendacionesSchema);


