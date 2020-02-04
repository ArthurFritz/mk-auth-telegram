const TelegramBot = require( `node-telegram-bot-api` )
const chamados = require ('./mk-auth')
const close = require('./close');
const TOKEN = process.env.TOKEN_TELEGRAN
const USERS = process.env.ALLOW_USERS.split(",")
const bot = new TelegramBot( TOKEN, { polling:  {
    interval: 1000
 } } )

const groupBy = key => array =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = obj[key];
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});
const groupAssunto = groupBy('assunto');

const userAllow = (msg)=>{
    let userAllow = USERS.find(item=> item == msg.chat.id)
    if(!userAllow){
        bot.sendMessage(msg.chat.id, `Olá ${msg.from.first_name}, infelizmente você não é usuário autorizado, caso necessite interações favor entrar em contato com a NgTelecom`);  
    }
    return userAllow;
}

bot.onText(/\/start/, (msg) => {
    if(userAllow(msg)){
        bot.sendMessage(msg.chat.id, `Olá ${msg.from.first_name}, bem vindo!!`);
    }
})

bot.onText(/\/fechar/, (msg) => {
    if(userAllow(msg)){
        chamados.listChamadosAbertosOrderLogin().then(suc=>{
            var line_keyboard = [];
            suc.forEach(item=>{
                line_keyboard.push([
                    {
                        text: `${item.login} - ${item.chamado}`,
                        callback_data: item.chamado
                    }
                ]);
            });
            bot.sendMessage(msg.chat.id, "Qual chamado deseja fechar?", {
                "reply_markup": {
                "inline_keyboard": line_keyboard
            }});
        });
    }
});

bot.on("callback_query", (callbackQuery) => {
    const message = callbackQuery.message;
    if(message.text == 'Qual chamado deseja fechar?' ){
        bot.sendMessage(message.chat.id, `Qual a mensagem para o fechamento do chamado ${callbackQuery.data} ?`,{
            "reply_markup": {
                "force_reply": true,
                "selective": true
        }}).then(sended=>{
            bot.onReplyToMessage(sended.chat.id, sended.message_id, callback => {
                console.log(`Fechando o chamado ${callbackQuery.data} pelo motivo ${callback.text}`);
                try{
                close.closeChamado(callbackQuery.data, callback.text).then(suc=>{
                    bot.sendMessage(sended.chat.id, suc);
                });
                } catch(ex){
                    console.log(ex);
                }
            })
        });
    }
})

bot.onText(/\/code/, (msg) => {
    bot.sendMessage(msg.chat.id, `Seu code é ${msg.chat.id}`);
})

bot.onText(/\/chamados/, (msg) => {
    if(userAllow(msg)){
        sendChamadosAbertos(msg.chat.id);
    }
})

bot.onText(/\/detalhe/, (msg) => {
    if(userAllow(msg)){
        chamados.listChamadosAbertos().then(suc=>{
            let message = "Chamados abertos:\n"
            let groupChamados = groupAssunto(suc);
            Object.keys(groupChamados).forEach(assunto=>{
                message += `- ${assunto}:\n`
                groupChamados[assunto].forEach(itemCham=>{
                    message += `${itemCham.login}\n`
                })
            })
            message += "so estes";
            bot.sendMessage(msg.chat.id, message)    
        },error=>{
            bot.sendMessage(msg.chat.id, `Erro ao buscar o detalhamento`)    
        })
    }
})

bot.onText(/\/finalizar ([\w-]+)/, (msg, match) => {
    console.log(match[1])
    if(userAllow(msg)){
        chamados.finishChamado(match[1]).then(suc=>{
            bot.sendMessage(msg.chat.id, `Feita a finalização manual do chamado ${match[1]}`)
        },error=>{
            bot.sendMessage(msg.chat.id, `Ocorreu um erro ao tentar finalizar manualmente o chamado ${match[1]}`)
        })       
    }
})

let lastChamado = null;
let totalChamadosAbertos = null;
function sendQuantityChamados(){
    chamados.totalChamadosAbertos().then(qtde=>{
        chamados.lastRegister().then(suc=>{
            if((suc && suc.chamado != lastChamado) || qtde && qtde != totalChamadosAbertos){
                lastChamado = suc.chamado;
                totalChamadosAbertos = qtde;
                USERS.forEach(chatId=>{
                    sendChamadosAbertos(chatId);
                })
            }
        })
    })
}

function sendChamadosAbertos(chatId){
    chamados.listChamadosAbertos().then(suc=>{
        let message = `Há um total de ${suc.length} chamado(s) aberto(s):\n`
        let groupChamados = groupAssunto(suc);
        Object.keys(groupChamados).forEach(assunto=>{
            message += `${groupChamados[assunto].length} - ${assunto}\n`
        })
        bot.sendMessage(chatId, message)    
    },error=>{
        bot.sendMessage(chatId, `Ocorreu um erro na consulta`)
    })
}

chamados.updateBase();
chamados.updateChamados();
sendQuantityChamados()
setInterval(sendQuantityChamados, 60000)
setInterval(chamados.updateChamados, 180000)
setInterval(chamados.updateBase, 300000)

module.exports = bot