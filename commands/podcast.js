module.exports = {
	name: 'podcast',
	guildOnly: true,
	execute(message, args, client, Discord, axios) {
		var embed = new Discord.MessageEmbed()
        .setColor('#4d6bdd')
        .setFooter(client.user.username + ' Bot', client.user.displayAvatarURL())
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setTimestamp()
		.addFields(
				{name: "Finanzfluss Podcast", value: "Hier geht's zu unserem Podcast: https://www.finanzfluss.de/podcast", inline:false}
			);
		
		message.channel.send(embed);
	},
};
