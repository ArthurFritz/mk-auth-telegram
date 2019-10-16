const axios = require('axios');
const chamados = require('../models/chamados')

module.exports = { 
        async updateBase(){
        const lastChamado = await chamados.findOne().sort("-abertura");
        const startDate = lastChamado.chamado.substring(0,6);
        axios.default.get(`${process.env.BASE_API_MK}chamado/listAll`).then(suc=>{
            suc.data.chamados.forEach(item=>{
                let started = false;
                if(started || item.chamado.indexOf(startDate) == 0){
                    started = true;
                    chamados.findOne({"chamado" : item.chamado}).then(exists=>{
                        console.log(`Incluindo chamado caso não exista ${item.chamado} ${exists == null}`);
                        if(!exists){
                            axios.default.get(`${process.env.BASE_API_MK}chamado/list/${item.chamado}`).then(sucDetail=>{
                                let detail = sucDetail.data;
                                chamados.insertMany({
                                    id: detail.id,
                                    assunto: detail.assunto,
                                    abertura: detail.abertura,
                                    visita: detail.visita,
                                    fechamento: detail.fechamento,
                                    status: detail.status,
                                    chamado: detail.chamado,
                                    login: detail.login,
                                    prioridade: detail.prioridade,
                                    login_atend: detail.login_atend,
                                    motivo_fechar: detail.motivo_fechar
                                })
                            });
                        }
                    },error=>console.log(error))
                }
            })    
        }, erros=>{console.log("error")})
    },

    async updateChamados(){
        let listChamados = await chamados.find({status:'aberto'});
        listChamados.forEach(item=>{
            console.log(`Verificando atualização ${item.chamado}`)
            axios.default.get(`${process.env.BASE_API_MK}chamado/list/${item.chamado}`).then(sucDetail=>{
                let detail = sucDetail.data;
                chamados.findOneAndUpdate({_id:item._id},{
                    id: detail.id,
                    assunto: detail.assunto,
                    abertura: detail.abertura,
                    visita: detail.visita,
                    fechamento: detail.fechamento,
                    status: detail.status,
                    chamado: detail.chamado,
                    login: detail.login,
                    prioridade: detail.prioridade,
                    login_atend: detail.login_atend,
                    motivo_fechar: detail.motivo_fechar
                })
            });
        })
    },

    async totalChamadosAbertos(){
        return await chamados.count({status:'aberto'});
    },

    async listChamadosAbertos(){
        return await chamados.find({status:'aberto'});
    },

    async finishChamado(chamado){
        return await chamados.findOneAndUpdate({chamado},{status: 'fechado'})
    },

    async lastRegister(){
        return await chamados.findOne().sort("-abertura");
    }

}
