const TelegramBot = require( `node-telegram-bot-api` )
const chamados = require ('./mk-auth')
const TOKEN = process.env.TOKEN_TELEGRAN
const USERS = process.env.ALLOW_USERS.split(",")
const bot = new TelegramBot( TOKEN, { polling: true } )

bot.onText(/\/start/, (msg) => {
    let userAllow = USERS.find(item=> item == msg.chat.id)
    if(userAllow){
        bot.sendMessage(msg.chat.id, `Olá ${msg.from.first_name}, bem vindo!!`)
    } else {
        bot.sendMessage(msg.chat.id, `Olá ${msg.from.first_name}, infelizmente você não é usuário autorizado, caso necessite interações favor entrar em contato com a NgTelecom`)
    }
})

bot.onText(/\/code/, (msg) => {
    bot.sendMessage(msg.chat.id, `Seu code é ${msg.chat.id}`);
})

bot.onText(/\/chamados/, (msg) => {
    let userAllow = USERS.find(item=> item == msg.chat.id)
    if(userAllow){
        chamados.totalChamadosAbertos().then(suc=>{
            bot.sendMessage(msg.chat.id, `Há um total de ${suc} chamado(s) aberto(s)`)
        },error=>{
            bot.sendMessage(msg.chat.id, `Ocorreu um erro na consulta`)
        })
    } else {
        bot.sendMessage(msg.chat.id, `Olá ${msg.from.first_name}, infelizmente você não é usuário autorizado, caso necessite interações favor entrar em contato com a NgTelecom`)
    }
})

bot.onText(/\/detalhe/, (msg) => {
    let userAllow = USERS.find(item=> item == msg.chat.id)
    if(userAllow){
        bot.sendMessage(msg.chat.id, `Ainda em implementação....`)
    } else {
        bot.sendMessage(msg.chat.id, `Olá ${msg.from.first_name}, infelizmente você não é usuário autorizado, caso necessite interações favor entrar em contato com a NgTelecom`)
    }
})

bot.onText(/\/finalizar ([\w-]+)/, (msg, match) => {
    console.log(match[1])
    let userAllow = USERS.find(item=> item == msg.chat.id)
    if(userAllow){
        chamados.finishChamado(match[1]).then(suc=>{
            bot.sendMessage(msg.chat.id, `Feita a finalização manual do chamado ${match[1]}`)
        },error=>{
            bot.sendMessage(msg.chat.id, `Ocorreu um erro ao tentar finalizar manualmente o chamado ${match[1]}`)
        })
        
    } else {
        bot.sendMessage(msg.chat.id, `Olá ${msg.from.first_name}, infelizmente você não é usuário autorizado, caso necessite interações favor entrar em contato com a NgTelecom`)
    }
})

let lastChamado = null;
function sendQuantityChamados(){
    chamados.lastRegister().then(suc=>{
        if(suc && suc.chamado != lastChamado){
            lastChamado = suc.chamado;
            USERS.forEach(chatId=>{
                chamados.totalChamadosAbertos().then(suc=>{
                    bot.sendMessage(chatId, `Há um total de ${suc} chamado(s) aberto(s)`)
                },error=>{
                    bot.sendMessage(chatId, `Ocorreu um erro na consulta`)
                })
            })
        }
    })
}

sendQuantityChamados()
setInterval(sendQuantityChamados, 60000)
setInterval(chamados.updateChamados, 180000)
setInterval(chamados.updateBase, 300000)

module.exports = bot