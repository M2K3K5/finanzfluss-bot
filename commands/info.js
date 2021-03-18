module.exports = {
	name: 'info',
	guildOnly: true,
	execute(message, args, client, Discord, messagePrefix, lastMsg, botUptimeConverted, joinedtime, restartTime, commandCount) {
        
        var embed = new Discord.MessageEmbed()
        .setTitle('Bot-Informationen')
        .setColor('#4d6bdd')
        .setFooter(client.user.username + ' Bot • Entwickelt von SEB#3606', client.user.displayAvatarURL())
        embed.addField('Benutzername', client.user.tag, true)
        embed.addField('Benutzer ID', client.user.id, true)
        .addField("Prefix", messagePrefix, true)
        .addField('Aktueller Status', client.user.presence.status, true);
        if(client.user.presence.activities[0]) {embed.addField('Statustext', presence(client.user.presence.activities[0].type) + " " + client.user.presence.activities[0].name, true)}
        else {embed.addField('Statustext', "keinen", true);}  
        if(client.user.lastMessage != undefined && client.user.lastMessage != null) {
            try{embed.addField('Letzte Nachricht', lastMsg, true)}
            catch{embed.addField('Letzte Nachricht', "keine", true);}
        }
        else {embed.addField('Letzte Nachricht', "keine", true)}

        var botUptimeString = botUptimeConverted;

        embed.setTimestamp()
            .addField('Server beigetreten', joinedtime, true) 
            .addFields(
                {name: "Entwickler", value: "SEB#3606", inline:true},
                {name: "Entwickelt seit", value: `5. Januar, 2021 (${parseInt((Date.now() - 1609804800000)/86400000)} Tage)`, inline:true},                
                {name: "Laufzeit", value: botUptimeString, inline: true},
                {name: "Letzter Neustart", value: restartTime, inline:true},
                {name: 'Server', value: client.guilds.cache.size, inline:true},
                {name: "Befehle", value: commandCount, inline:true},
            )
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setThumbnail(client.user.displayAvatarURL())
            message.channel.send(embed);

        function presence(p) {
            p = p.toLocaleLowerCase();
            if(p == "watching") {p = "Schaut";}
            else if(p == "playing") {p = "Spielt";}
            else if(p == "listening") {p = "Hört";}
            return p;
        }
	},
};
