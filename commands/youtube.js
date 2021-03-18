module.exports = {
	name: 'youtube',
	aliases: ["yt"],
	guildOnly: true,
	execute(message, args, client, Discord, axios) {
		var embed = new Discord.MessageEmbed()
        .setColor('#4d6bdd')
        .setFooter(client.user.username + ' Bot', client.user.displayAvatarURL())
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setTimestamp()
		.addFields(
				{name: "Finanzfluss YouTube-Channel", value: "Hier ist der Link zu unserem YouTube-Channel: https://www.youtube.com/c/finanzfluss", inline:false}
			);
		
		message.channel.send(embed);
	},
};
