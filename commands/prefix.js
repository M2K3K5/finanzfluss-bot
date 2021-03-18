module.exports = {
	name: 'prefix',
	guildOnly: true,
	execute(message, args, client, Discord) {
		if(message.member.hasPermission('ADMINISTRATOR') )
        {
            if(args[1] != undefined) 
            {
                var x = args[1];
                if(x.length < 4) 
                {
                    uploadPrefix(message, x) ;
                }
                else {message.reply("bitte wähle einen neuen Prefix, welcher weniger als 4 Zeichen lang ist...");}
            }
            else {message.reply("bitte gebe einen neuen Prefix ein...\nBeispiel: .prefix f.");}
        }
        else {message.reply("dir fehlen die Rechte `Administrator` für Befehl: " + args[0]);}

        function uploadPrefix (message, prefix) {
            var guildID = message.guild.id;
            if(if2(guildID, "a", 1)) {}
            client.guildSettings[guildID].prefix = escape(prefix);           
            if(client.saveGuildSettings(message.guild.id)) {message.reply(`Prefix ist nun ${unescape(client.guildSettings[message.guild.id].prefix)}`);}
            else {message.reply("konnte den Prefix unerwartet nicht ändern! Wenn diese Nachricht erscheint, dann kontaktiere bitte SEB#3606");}          
        }
        
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
