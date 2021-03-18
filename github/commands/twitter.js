module.exports = {
	name: 'twitter',
	guildOnly: true,
	execute(message, args, client, Discord, axios) {
		var embed = new Discord.MessageEmbed()
        .setColor('#4d6bdd')
        .setFooter(client.user.username + ' Bot', client.user.displayAvatarURL())
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setTimestamp()
		.addFields(
				{name: "Finanzfluss Twitter", value: "Hier ist der Link zu unserem Twitter Profil: https://www.twitter.com/finanzfluss", inline:false}
			);
		
		message.channel.send(embed);
	},
};
