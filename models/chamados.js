var mongoose = require('mongoose');

var ChamadosSchema = new mongoose.Schema({
    id: Number,
    assunto: String,
    abertura: Date,
    visita: Date,
    fechamento: Date,
    status: String,
    chamado: String,
    login: String,
    prioridade: String,
    login_atend: String,
    motivo_fechar: String
});
 
module.exports = mongoose.model('Chamados', ChamadosSchema);