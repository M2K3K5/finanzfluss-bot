module.exports = {
	name: 'twitch',
	guildOnly: true,
	execute(message, args, client, Discord, axios) {
		var embed = new Discord.MessageEmbed()
        .setColor('#4d6bdd')
        .setFooter(client.user.username + ' Bot', client.user.displayAvatarURL())
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setTimestamp()
		.addFields(
				{name: "Finanzfluss Twitch", value: "Hier ist der Link zu unserem Twitch Profil: https://www.twitch.tv/finanzfluss", inline:false}
			);
		
		message.channel.send(embed);		
	},
};
