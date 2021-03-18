module.exports = {
	name: 'pingantwort',
	guildOnly: true,
	execute(message, args, client, Discord) {
		if(message.member.hasPermission('ADMINISTRATOR'))
        {
            if(args[1] == undefined) {
                var result = "an";
                var nicht = "";
                if(if2(message.guild.id, "pingantwort", 0)) {result = "aus"; nicht = "nicht ";}
                message.reply(`Pingantwort ist aktuell ${result}. Bei meiner Erwähnung, werde ich also ${nicht}antworten`)
                return;
            }
            else if(args[1].toLowerCase() == "aus") {
                if(if2(message.guild.id, "pingantwort", 1)) {}
                client.guildSettings[message.guild.id].pingantwort = false;
            }
            else if(args[1].toLowerCase() == "an") {
                if(if2(message.guild.id, "pingantwort", 0)) {
                    delete client.guildSettings[message.guild.id].pingantwort;
                }
                else {message.reply(`deaktivierung fehlgeschlagen! Pingantwort war nicht aktiviert...`)}
            }
            else {message.reply(`du hast keine verfügbare Option angegeben ... Verfügbare Optionen: an/aus`);}
            
            if(client.saveGuildSettings(message.guild.id)) {message.reply(`pingantwort ist jetzt ${args[1].toLowerCase()}!`);}
            else {message.reply(`ups, da ist wohl etwas schiefgelaufen...`);}
        }
        else {message.reply("dir fehlen die Rechte `Administrator` für Befehl: " + args[0]);}
        
        function if2(guildID, objectName, createIfNoExist) {
            if(client.guildSettings != undefined) {
                if(!client.guildSettings[guildID] && createIfNoExist == 1) {client.guildSettings[guildID] = {};}
                else if(client.guildSettings[guildID] == undefined) {return false;}
                var result = false;
                if(objectName == "a") {if(client.guildSettings[guildID] != undefined) {result = true;}}
                else if(client.guildSettings[guildID][objectName] != undefined) {result = true;}
                return result;
            }
            else {return false;}
        }  
	},
};
