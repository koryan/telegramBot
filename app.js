var TelegramBot = require('node-telegram-bot-api');
var express = require('express');
var token = '317314528:AAHrU-SvGt37UGfd9K7BFph1xlkiTHanN8M';
var bot = new TelegramBot(token, {polling: true});
var http = require('http');
var app = module.exports = express();


app.set('port', 3000);

var chatClass = function(chat){
    this.id = chat.id;
    this.data = chat
    this.startDate = 
    this.sendMsg = function(text){
        bot.sendMessage(this.id, text, {caption: "I'm a bot!"});
    }
}
var getChatName = function(obj){
    return (obj.type == "private")?combineUserName(obj):obj.title
}

var combineUserName = function(obj){
    var result = obj.first_name
    if(obj.last_name)result += " "+obj.last_name;
    if(obj.username)result += " ("+obj.username+")";
    return result
}

var chats = {};
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/sendMsg/:text', function(req, res, next){ 
    
    if(Object.keys(chats).length == 0){
        res.send("No active chats");
        console.log("No active chats")
        return
    }
   
    for(var chatId in chats){
        
        chats[chatId].sendMsg(req.params.text)
    }
   
   // bot.sendMessage(chatId, "пинг", {caption: "I'm a bot!"});
    res.send("sended to all");
}); 

app.get('/sendMsg/:text/:chatId', function(req, res, next){ 
    
    if(!chats[req.params.chatId]){
        res.send("Chat "+ req.params.chatId + " not found ^(");
        console.log("Chat "+ req.params.chatId + " not found ^(")
        return
    }

    chats[req.params.chatId].sendMsg(req.params.text)
    res.send("sended private to "+getChatName(chats[req.params.chatId].data));
}); 

app.get('/list', function(req, res, next){ 
    
    if(Object.keys(chats).length == 0){
        res.send("No active chats");
        console.log("No active chats")
        return
    }
    var answer = [];
    for(var i in chats){
        // console.log(i, chats[i])
        var el = chats[i]
        answer.push({id: el.id,
            name: getChatName(el.data)
        })
    }

   // bot.sendMessage(chatId, "пинг", {caption: "I'm a bot!"});
    res.send(answer);
}); 

app.get('/', function(req, res, next){ 
    var urls = {"list":"список комнат", "sendMsg/<b>строка</b>":"рассылка строки во ВСЕМ комнатам", "sendMsg/<b>строка</b>/<i>id комнаты</i>":"отсылка строки в конкретную комнату"}
    var ans = ""
    for(var i in urls){
        ans+="<tr><td>/"+i+"</td><td>"+urls[i]+"</td>"
    }
    var ans = "<h3>Urls list</h3><table border='1'>"+ ans +"</table>"
    res.send(ans);
}); 

bot.on('message', function (msg) {
    var chatId = msg.chat.id;
    
    
    if(!chats[chatId]){
        var chat = new chatClass(msg.chat)
        chats[chatId]  = chat
        bot.sendMessage(chatId, "Hello, I im a bot, and i've just entered this dialog!", {caption: "I'm a bot!"});
        console.log("Add chat ", chat)
        console.log(msg)
    }else{
        chat = chats[chatId]
        console.log("Already registered chat")
    }

    if(msg.text == "/list"){
        var j = 0;
        var answer = [];
        for(var i in chats){
            j++;
            // console.log(i, chats[i])
            var el = chats[i]
            answer.push("id: "+el.data.id)
            answer.push("type: "+ el.data.type)
            answer.push("name: "+getChatName(el.data))
            answer.push("")
        }
        bot.sendMessage(chatId, answer.join("\n\r"), {caption: "I'm a bot!"});
    }

    if(msg.text && !!~msg.text.search( /\/kick -?(\d+)/ )){
        var idForKick = msg.text.match( /\/kick (\d+)/ )[1]
        var chatName = getChatName(chats[idForKick].data);
        chats[idForKick].sendMsg("You have been kicked from send list.")
        delete chats[idForKick];
        bot.sendMessage(chatId, chatName+" was kicked from list", {caption: "I'm a bot!"});
    }
   
    //bot.sendMessage(chatId, "test", {caption: "I'm a bot!"});
});



http.createServer(app).listen(app.get('port'), function () {
  console.log('Server listening on port ' + app.get('port'));
});
