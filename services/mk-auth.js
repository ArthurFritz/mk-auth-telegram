const axios = require('axios');
const chamados = require('../models/chamados')

module.exports = { 
        async updateBase(){
        const lastChamado = await chamados.findOne().sort("-abertura");
        const startDate = lastChamado.abertura;
        axios.default.get(`${process.env.BASE_API_MK}chamado/listAll?nocache=${new Date().getTime()}`).then(suc=>{
            suc.data.chamados.forEach(item=>{
                if(item.abertura.getTime() >= startDate.getTime()){
                    chamados.findOne({"chamado" : item.chamado}).then(exists=>{
                        console.log(`Incluindo chamado caso não exista ${item.chamado} ${exists == null}`);
                        if(!exists){
                            axios.default.get(`${process.env.BASE_API_MK}chamado/list/${item.chamado}?nocache=${new Date().getTime()}`).then(sucDetail=>{
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
        let listChamados = await chamados.find({status:'aberto', "abertura": {"$gte": new Date(2019, 1, 1), "$lt": new Date(2020, 1, 1)}});
        listChamados.forEach(item=>{
            console.log(`Verificando atualização ${item.chamado}`)
            axios.default.get(`${process.env.BASE_API_MK}chamado/list/${item.chamado}?nocache=${new Date().getTime()}`).then(sucDetail=>{
                let detail = sucDetail.data;
                chamados.findOneAndUpdate({id:item.id},{
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
                }).then(suc=>{
                    console.log("updated")
                })
            });
        })
    },

    async totalChamadosAbertos(){
        return await chamados.countDocuments({status:'aberto', "abertura": {"$gte": new Date(2019, 1, 1), "$lt": new Date(2020, 1, 1)}});
    },

    async listChamadosAbertos(){
        return await chamados.find({status:'aberto', "abertura": {"$gte": new Date(2019, 1, 1), "$lt": new Date(2020, 1, 1)}});
    },

    async finishChamado(chamado){
        return await chamados.findOneAndUpdate({chamado},{status: 'fechado'})
    },

    async lastRegister(){
        return await chamados.findOne().sort("-abertura");
    }

}
