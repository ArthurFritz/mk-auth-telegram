# mk-auth-telegram

This project is integration this  `mk-auth` to telegram, where possibility verify quantity called support, and notificate new called.

## Dependency
`Node.js`
`MongoDB`

### Parameters
This parameters in the project used enviorioments:
`TOKEN_TELEGRAN` - This token your bot in the telegram
`URL_MONGO` - Address your mongoDB
`BASE_API_MK` - Addres server MK-AUTH for example `http://api:myToken@serverAddress/api/`
`ALLOW_USERS` - Code users allow in the bot, separate users `CODE,CODE` don't use spaces :)

### Commands telegram
`/code` - Request code user to allow
`/chamados` - Show called support
`/detalhe` - Detail called support separate for subject and show login for users
`/finalizar` - Close called support in the bot


### Routines
`1min` - Verify updates in the bot, case has update send message to `ALLOW_USERS`
`3min` - Verify oppened called in the bot has updates
`5min` - Verify new called support to add in the bot
