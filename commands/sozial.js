module.exports = {
	name: 'sozial',
	aliases: ["sm", "soziales", "soziale", "socials","social", "socialmedia", "social media"],
	description: 'Alle Sozialen Plattformen',
	guildOnly: true,
	execute(message, args, client, Discord, axios) {
		var embed = new Discord.MessageEmbed()
        .setColor('#4d6bdd')
        .setFooter(client.user.username + ' Bot', client.user.displayAvatarURL())
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setTimestamp()
		.setTitle("Finanzfluss Soziale Plattformen")
		.addFields(
				{name: "Instagram", value: "https://www.instagram.com/finanzfluss", inline:false},
				{name: "YouTube", value: "https://www.youtube.com/c/finanzfluss", inline:false},
				{name: "Twitch", value: "https://www.twitch.tv/finanzfluss", inline:false},
				{name: "Twitter", value: "https://www.twitter.com/finanzfluss", inline:false},
				{name: "Podcast", value: "https://www.finanzfluss.de/podcast", inline:false},
				{name: "Website", value: "https://www.finanzfluss.de", inline:false}
			);
		
		message.channel.send(embed);
	},
};
