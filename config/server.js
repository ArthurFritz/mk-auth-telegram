const express   = require('express');
var app         = express(); 
 
var server_port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080; 
 
app.listen(server_port, function(){
 console.log( "Listening  port " + server_port )
});

app.get("*", (req, response)=>{
    response.send("Service its works")
})

module.exports = app