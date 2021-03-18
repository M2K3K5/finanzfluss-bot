module.exports = {
	name: 'status',
	guildOnly: true,
	execute(message, args, client, Discord, axios) {
            if(client.admin(message))
            {       
                if(args[1] == undefined) {message.reply(`du hast keine Option angegeben ... Verfügbare Optionen: hinzufügen/entfernen/auflisten/wechseln`)}
                else if(args[1].toLowerCase() == "setzen") {
                    var status = "";
                    for(var i = 2; i < args.length; i++) {
                        status += args[i] + " ";
                    }            
                    clearTimeout(client.switchRPstatusTimeout);
                    setRPstatus(status);
                }
                else if(args[1].toLowerCase() == "hinzufügen") {
                    var status = "";
                    for(var i = 2; i < args.length; i++) 
                    {
                        status += args[i] + " ";
                    }
                    status = status.slice(0, status.length-1);

                    var type = status.slice(0, status.indexOf(" "));
                    if(type == "schaut") {type = "WATCHING";}
                    else if(type == "spielt") {type = "PLAYING";}
                    else if(type == "hört") {type = "LISTENING";}
                    else {message.reply(`du hast vergessen, einen Art zu erwähnen... Verfügbare Arten: schaut/spielt/hört`); return;}

                    client.richPresenceStatusList.push(status);
                    message.reply(`${status} wurde der Statusliste hinzugefügt`);
                }
                else if(args[1].toLowerCase() == "entfernen") {
                    var deleted = 0;
                    var status = "";
                    for(var i = 2; i < args.length; i++) 
                    {
                        status += args[i] + " ";
                    }
                    status = status.slice(0, status.length-1);

                    var type = status.slice(0, status.indexOf(" "));
                    if(!(type == "schaut" || type == "spielt" || type == "hört")) {message.reply(`du hast vergessen, einen Art zu erwähnen... Verfügbare Arten: schaut/spielt/hört`); return;}

                    var arr = [];
                        for(var i = 0; i < client.richPresenceStatusList.length; i++) 
                        {
                            if(client.richPresenceStatusList[i] == status) {deleted = 1;}
                            else {arr.push(client.richPresenceStatusList[i]);}
                        }
                        client.richPresenceStatusList = arr;
                    
                    if(deleted == 1) {message.reply(`${status} wurde von der Statusliste entfernt`);}
                    else {message.reply(`${status} konnte nicht aus der Statusliste entfernt werden`);}
                }
                else if(args[1].toLowerCase() == "auflisten") {
                    if(client.richPresenceStatusList.length == 0) {message.reply(`keine Einträge in der Statusliste...`); return;}
                    var list = "";
                    for(var i = 0; i < client.richPresenceStatusList.length; i++) 
                    {
                        var type = client.richPresenceStatusList[i].slice(0, client.richPresenceStatusList[i].indexOf(" "));                        

                        if(i == 0) {list += type + " " + client.richPresenceStatusList[i].slice(client.richPresenceStatusList[i].indexOf(" ")+1, client.richPresenceStatusList[i].length);}
                        else { list += "\n"; list += type + " " + client.richPresenceStatusList[i].slice(client.richPresenceStatusList[i].indexOf(" ")+1, client.richPresenceStatusList[i].length);}
                    }
                    var embed = returnEmbedStandards(message)
                    .setDescription(list);
                    message.channel.send(embed);
                }
                else if(args[1].toLowerCase() == "wechseln") {
                    if(args[2] == "an") {switchRPstatus(); message.channel.send("Automatisches Status wechseln aktiviert");}
                    else if(args[2] == "aus") {clearTimeout(client.switchRPstatusTimeout); message.channel.send("Automatisches Status wechseln deaktiviert");}
                    else {message.reply("Bitte wähle einen Art: an/aus");}
                }
                else {
                    message.reply(`du hast keine verfügbare Option angegeben ... Verfügbare Optionen: hinzufügen/entfernen/auflisten/wechseln`);
                }
            }
            else {message.reply("dir fehlen die Rechte `Botadministrator` für Befehl: " + args[0]);}
               
        

        function setRPstatus(status) 
        {
            var type = status.slice(0, status.indexOf(" "));
            if(type == "schaut") {type = "WATCHING";}
            else if(type == "spielt") {type = "PLAYING";}
            else if(type == "hört") {type = "LISTENING";}
            else {message.reply(`du hast vergessen, einen Art zu erwähnen... Verfügbare Arten: schaut/spielt/hört`); return;}
            
            message.channel.send('Status wurde gesetzt: '+status + "");
            status = status.slice(status.indexOf(" ")+1, status.length);

            client.user.setPresence({
                activity: {
                    name: status,
                    type: type
                },
                status: 'online'
            });
        }
        
        function returnEmbedStandards(message)
        {
            var embed = new Discord.MessageEmbed()
            .setColor('#33ff11')
            .setFooter(client.user.username + ' Bot', client.user.displayAvatarURL())
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp();
            return embed;
        }
        
        function switchRPstatus() 
        {
            var switchTime = 5;
            switchTime *= 1000;

            try{if(client.switchRPstatusCount == client.richPresenceStatusList.length) {client.switchRPstatusCount = 0;}

            var richPresenceStatusType = richPresenceStatusType = client.richPresenceStatusList[client.switchRPstatusCount].slice(0, client.richPresenceStatusList[client.switchRPstatusCount].indexOf(" "));
            if(richPresenceStatusType == "schaut") {richPresenceStatusType = "WATCHING";}
            else if(richPresenceStatusType == "spielt") {richPresenceStatusType = "PLAYING";}
            else if(richPresenceStatusType == "hört") {richPresenceStatusType = "LISTENING";}
            var richPresenceStatusName = client.richPresenceStatusList[client.switchRPstatusCount].slice(client.richPresenceStatusList[client.switchRPstatusCount].indexOf(" ")+1, client.richPresenceStatusList[client.switchRPstatusCount].length);

            client.user.setPresence({
                activity: {
                    name: richPresenceStatusName,
                    type: richPresenceStatusType
                },
                status: 'online'}
            ); 
            }catch(e){
                if(client.richPresenceStatusList.length <= 0) {
                    client.user.setPresence({ activity: { name: '' }, status: 'online' })
                }
            }

            client.switchRPstatusCount++;
            client.switchRPstatusTimeout = setTimeout(switchRPstatus, switchTime);      
        }
	},
};
