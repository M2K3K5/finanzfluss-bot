const Discord = require('discord.js');
const axios = require('axios');

const client = new Discord.Client();
client.commands = new Discord.Collection();
const config = getConfig();
const fs = require("fs");
client.fs = fs;
const token = config.token;
const prefix = config.prefix;
console.log(`prefix: ${prefix}`)

var embedNameEmpty = "\u200B";
var dot = "•";
var lastCommandMessageObject;
var commandsWithExtraRun = ["info"];
client.ownerId = "999999999999999999";
var botlogchannel = "999999999999999999";
var botbackupchannel = "999999999999999999";
client.guildSettings = {};
client.schlaf = false;
client.uses = {};


function getConfig() {
    var result = "";
    try{result = require('./config2.json');}
    catch{result = require('./config.json');}

    if(result != "") {return result;}
}

client.saveGuildSettings = 
function saveGuildSettings(name, object) {    
    var result = true;
    if(client.guildSettings[name] != undefined && JSON.stringify(client.guildSettings[name]) != undefined && JSON.stringify(client.guildSettings[name]) != "undefined") {
        console.log(JSON.stringify(client.guildSettings[name]));
        fs.writeFile(`./serversettings/${name}.json`, JSON.stringify(client.guildSettings[name]), function (err) {
            if (err) {result = false; throw err}
        });
        console.log(client.guildSettings)
    }
    return result;
}

function loadGuildsettings() {
    console.log("old guildSettings:")
    console.log(client.guildSettings)
    var x = fs.readdirSync("./serversettings");
    for(var file of x) {
        client.guildSettings[file.slice(0, file.length-5)] = JSON.parse(client.fs.readFileSync(`./serversettings/${file}`, 'utf8'));
    } 
    console.log("new guildSettings:")
    console.log(client.guildSettings)
}

function loadCommands() {
    const commandFiles = client.fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        delete require.cache[require.resolve(`./commands/${file}`)];
        const command = require(`./commands/${file}`);
        client.commands.set(command.name, command);
    };
}
loadCommands();

function resetCommands() {client.commands.clear();}

client.on('ready', async ()=>{init();})

function login() {client.login(token);}
login();

function init() 
{   
    client.user.setStatus('online');
    client.log('Bot ist online! ' + timeConverter(Date.now()) + ` (Befehle: ${commandCount}/${client.commands.size})`, "lime")    
    
    switchRPstatusCount = 0;
    client.richPresenceStatusList = client.richPresenceStatusListOnStart;
    switchRPstatus();
    
    if(process.platform == 'linux') {
        setTimeout(()=>{
            client.backupGuildSettings(); 
            setInterval(client.backupGuildSettings, 43200000);               

            var t = tilNewDay();
            t += 18000000;
            client.log(`resetNotifiedArrays in (${t}ms), at ${(new Date(Date.now()+t)).toString()}`);
            setTimeout(resetNotifiedArrays, t);

            var t2 = tilCheck();
            client.log(`checkeAktienKursänderung in (${t2}ms), at ${(new Date(Date.now()+t2)).toString()}`);
            setTimeout(()=>{
                client.checkeAktienKursänderung();
                setInterval(client.checkeAktienKursänderung, 1800000);
            }, t2);
        }, 3000);
    }

    setTimeout(loadGuildsettings, 200);
}

var help = {};
help.main = [`**f!aktie {WKN/Name}** Zeigt Details über eine Aktie`, `**f!hilfe depot** Für eine Command Übersicht bezogen auf das Depot`, `**f!social media** Zeigt eine Übersicht über die Social Media Kanäle des Finanzfluss Teams`, 
            `**f!depot hinzufügen {Name/WKN}** Fügt deinem Depot eine Aktie hinzu`, `**f!depot entfernen {Name/WKN}** Entfernt eine Aktie aus deinem Depot`,
            `**f!depot schließen** Entfernt alle Aktien aus deinem Depot`, `**f!depot ansicht [@Username oder ID]** Übersicht über das Depot eines Users`, 
            `**f!depot server** Zeigt eine Serverweite Statistik über die Aktien, die User in ihrem Depot haben`, 
            `**f!depot einstellungen** Eine Übersicht über die Einstellungen deines Depots`, 
            `**f!depot einstellungen sichtbar {an/aus}** Verändert die Privatsphäre deines Depots und macht dein Depot sichtbar für andere User`, 
            `**f!depot einstellungen benachrichtigung {an/aus} [Kursänderung in %]** Ermöglicht dir bei gewisser Kursänderung (Standard bei 5%) benachrichtigt zu werden`];
help.administrative = [`**prefix** {neuer Prefix} ändert den Bot prefix`];
help.description = `Commands innerhalb der {geschweiften Klammern} sind Pflicht, während [Klammern] optional sind.`;

var commandCount = 0;
var commandsWithDescArray = [];
var commandsArray = [];

for(var i = 0; i < help.main.length; i++) {commandsWithDescArray.push(help.main[i]);} 
for(var i = 0; i < help.administrative.length; i++) {commandsWithDescArray.push(help.administrative[i]);} 
for(var i = 0; i < commandsWithDescArray.length; i++) {commandsArray.push(commandsWithDescArray[i].slice(2, commandsWithDescArray[i].lastIndexOf("**")));} 
commandCount = commandsArray.length;



client.on('message', message => {
    if(message.author.bot) return;

    if(message.guild) {
        if(message.channel.permissionsFor(message.guild.me).toArray().includes('SEND_MESSAGES') == false) {return;}
    }

    let args;
    if(!message.guild) {args = message.content.substring(prefix.length).split(' ');}
    else {
        args = message.content.substring(returnPrefixLengthFromMessage(message)).split(' ');

        if(maintenance == 0 && !message.content.startsWith(returnPrefixFromMessage(message))) 
        {
            if(args[0] != undefined && commandsArray.includes(args[0].toLowerCase())) {}
            else if(args[0] != undefined && client.commands.has(args[0].toLowerCase())) {}
            else if(args[0] != undefined && client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0].toLowerCase())) != undefined) {}
            else if(args[1] != undefined && commandsArray.includes(args[1].toLowerCase())) {}
            else if(args[1] != undefined && client.commands.has(args[1].toLowerCase())) {}
            else if(args[1] != undefined && client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[1].toLowerCase())) != undefined) {}
            else if((message.content.includes(`<@${client.user.id}>`) || message.content.includes(`<@!${client.user.id}>`))) 
            {           
                if(!returnIsAnsweringAtPing(message)) {return;}  
                message.reply(`hey, ich bin der Finanzfluss Bot 👍\nWenn du etwas bestimmtes möchtest, dann kannst du meine Befehle mit meiner Erwähnung (<@${client.user.id}>) am Anfang deiner Nachricht nutzen oder mit meinem Prefix ${returnPrefixFromMessage(message)} \nWenn du Hilfe brauchst, dann schreiben einfach ${returnPrefixFromMessage(message)}hilfe 😀`); 
                return;
            }
        }
    }

    if(!message.content.startsWith(returnPrefixFromMessage(message)) && !message.content.startsWith(`<@${client.user.id}`) && !message.content.startsWith(`<@!${client.user.id}`) ) return;

    if(message.content.startsWith(`<@${client.user.id}`) || message.content.startsWith(`<@!${client.user.id}`)) 
    {
        args = message.content.split(' ');
        args.shift();
        if(args[0] == " " || args[0] == "") {args.shift();}
        
        var pingsInMessage = 0;
        var x = message.content;
        while(x.includes(`<@${client.user.id}`) || x.includes(`<@!${client.user.id}`)) 
        {
            pingsInMessage++; 
            var oldLength = x.length;
            x = x.replace(`<@${client.user.id}`, "");
            if(oldLength == x.length) {x = x.replace(`<@!${client.user.id}`, "");}
        }
        
        if(message.mentions.users.array().length > 1 || pingsInMessage == 1) {message.mentions.users.delete(client.user.id);}
    }
    lastCommandMessageObject = message;


    if(args[0] == "wartung" && (args[1].toLowerCase() == "an" || args[1].toLowerCase() == "aus")) {
        if(!client.admin(message)) {message.reply("dir fehlen die Rechte `Botadministrator` für Befehl: " + args[0]); return;}
        maintenanceToggle(message, args);
        return;
    }
    else if(maintenance == 1) {message.channel.send("⚠️ Ich werde aktuell Gewartet. Bitte versuche es später erneut ⚠️");}
    else if(args[0] == "schlaf"&&(args[1].toLowerCase() == "an" || args[1].toLowerCase() == "aus")) {
        if(!client.admin(message)) {message.reply("dir fehlen die Rechte `Botadministrator` für Befehl: " + args[0]); return;}
        schlafToggle(message, args); 
        return;
    }
    else if(client.schlaf) {return;}
    else if(args[0] == "aktiviere") {
        if(!client.admin(message)) {message.reply("dir fehlen die Rechte `Botadministrator` für Befehl: " + args[0]); return;}
        enableCommand(message, args[1]);
        return;
    }
    else if(args[0] == "deaktiviere") {
        if(!client.admin(message)) {message.reply("dir fehlen die Rechte `Botadministrator` für Befehl: " + args[0]); return;}
        disableCommand(message, args[1]);
        return;
    }
    else if(commandIsDisabled(args[0]) == true) {message.channel.send(`🚫 Befehl **_${args[0]}_** ist aktuell deaktiviert! Bitte versuche es später erneut oder kontaktiere einen Admin`);}
    else if(client.uses[message.author.id] != undefined) {message.reply(`Bitte beachte die Wartezeit zwischen Befehlen von 2 Sekunden!`).then(m=>{setTimeout(()=>{try{m.delete();}catch{}}, 3000)}); return;}

    else {
        uses(message.author.id, 2);
        try{args[0] = args[0].toLowerCase();} catch{}
        //whole switch function
        
        const command = args[0];

        var allowed = ["d", "depot", "a", "aktie", "hilfe", "help", "instagram", "insta", "sozial", "sm", "soziales", "soziale", "socials","social", "socialmedia", "social media", "twitch", "twitter", "youtube", "yt"];
        if(!message.guild && !client.commands.has(command) && !allowed.includes(command.toLowerCase())) {message.reply(`Befehl nicht gefunden: _${command}_ !`); return;}
        else if(!message.guild && !allowed.includes(command.toLowerCase())) {message.reply(`Der Befehl _${command}_ ist nicht im privat Chat nutzbar...`); return;}

        if (client.commands.has(command) && !commandsWithExtraRun.includes(command)) {  
            try {client.commands.get(command).execute(message, args, client, Discord, axios)}         
            catch (error) {message.channel.send('Ups, da ist wohl etwas schiefgelaufen...');}
            return;
        }

        else if (client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command)) != undefined) {
            try {client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command)).execute(message, args, client, Discord, axios)}
            catch (error) {message.channel.send('Ups, da ist wohl etwas schiefgelaufen...');}        
            return;
        }
        
        switch(args[0]) {
            case '':
                message.reply("du hast keinen Befehl angegeben!\nBeispiel: `f!hilfe depot`");
                break;
            case 'help':
                args[0] = "hilfe";
            case 'hilfe':
                    var type = 0;
                    if(args[1] != undefined) 
                    {
                        type = 1;
                        var msg = "";

                        if(args[1].toLowerCase() == "depot") {
                            var embed = returnEmbedStandards(message)
                            .setTitle(`Depot Befehl`)
                            .addFields(
                                {name: `• f!depot hinzufügen {Name/WKN} [Preis]`, value: `Fügt deinem Depot eine Aktie hinzu.\n`+"`f!d add Apple` oder `f!d + Apple`", inline:false},
                                {name: `• f!depot entfernen {Name/WKN}`, value: "Entfernt eine Aktie aus deinem Depot.\n`f!d entfernen Apple` oder `f!d - Apple`", inline:false},
                                {name: `• f!depot schließen`, value: "Entfernt alle Aktien aus deinem Depot.\n`f!d schließen`", inline:false},
                                {name: `• f!depot ansicht [@Username oder ID]`, value: "Übersicht über das Depot eines Users.\n`f!d ansicht @user#9999`", inline:false},
                                {name: `• f!depot server`, value: "Zeigt eine Serverweite Statistik über die Aktien, die User in ihrem Depot haben.\n`f!d server`", inline:false},
                                {name: `• f!depot einstellungen`, value: "Eine Übersicht über die Einstellungen deines Depots.\n`f!d einstellungen`", inline:false},
                                {name: `• f!depot einstellungen sichtbar {an/aus}`, value: "Verändert die Privatsphäre deines Depots und macht dein Depot sichtbar für andere User.\n`f!d einstellungen sichtbar aus`", inline:false},
                                {name: `• f!depot einstellungen benachrichtigung {an/aus} [Kursänderung in %]`, value: "Ermöglicht dir bei gewisser Kursänderung (Standard bei 5%) benachrichtigt zu werden.\n`f!d einstellungen benachrichtigung an 4`", inline:false},
                                {name: embedNameEmpty, value: "Commands innerhalb der {geschweiften Klammern} sind Pflicht, während [Klammern] optional sind.", inline:false},
                            )
                            
                            message.channel.send(embed);                    
                            return;
                        }

                        if(msg != "") {break;}
                        else {args[0] = args[1]; messageSwitchCommandSearch(message, args); break;}
                    }
                    else {type = 2;}
                    if(type == 2)
                    {
                        var embed = returnEmbedStandards(message);
                            embed.setTitle('Verfügbare Befehle:')
                            .addFields(
                                {name: "• aktie {WKN/Name}", value: "Zeigt Details über eine Aktie.\n`f!aktie Apple`", inline:false},
                                {name: "• hilfe depot", value: "Für eine Command Übersicht bezogen auf das Depot.\n`f!hilfe depot`", inline:false},
                                {name: "• social media", value: "Zeigt eine Übersicht über die Social Media Kanäle des Finanzfluss Teams.\n`f!social media`", inline: false},
                                {name: embedNameEmpty, value: "Commands innerhalb der {geschweiften Klammern} sind Pflicht, während [Klammern] optional sind.", inline: false},

                            )

                            message.channel.send(embed);
                    }
                    break;
            case 'herunterfahren':
                if(message.member.id == client.ownerId) 
                {
                    message.channel.send('herunterfahren...');
                    shutdown();
                }
                else {message.reply("dir fehlen die Rechte `Bot Besitzer` für Befehl: " + args[0]);}
                break;  
            case 'info':
                var restartTime = timeConverter(Date.now() - client.uptime);
                client.commands.get('info').execute(message, args, client, Discord, 
                    returnPrefixFromMessage(message), timeConverter(client.user.lastMessage.createdTimestamp), convertBotUptime(client.uptime), timeConverter(message.guild.joinedTimestamp), restartTime, commandCount);
                    break;
            case 'reload':
                args[0] = "aktualisieren";
            case 'aktualisieren':
                if(message.author.id == client.ownerId) 
                {
                    resetCommands();
                    setTimeout(()=>{
                        console.log(client.commands.array())
                        loadCommands();
                        message.reply(`erfolgreich aktualisiert!`);
                        console.log(client.commands.array())
                    }, 500);
                    break; 
                } 
                else {message.reply("dir fehlen die Rechte `Bot Besitzer` für Befehl: " + args[0]);}        
                break;
            default: {
                messageSwitchCommandSearch(message, args);            
                break;        
            }
        } //end switch
    }//after maintenance if else 
})






function messageSwitchCommandSearch(message, args)
{
    if(message.content != `<@${client.user.id}>` && message.content != `<@!${client.user.id}>`) {
        message.channel.send(`Befehl nicht gefunden: ___**${args[0]}**___ !`);
    }
    else {
        if(!returnIsAnsweringAtPing(message)) {return;}  
        message.reply(`hey, ich bin der Finanzfluss Bot 👍\nWenn du etwas bestimmtes möchtest, dann kannst du meine Befehle mit meiner Erwähnung (<@${client.user.id}>) am Anfang deiner Nachricht nutzen oder mit meinem Prefix ${returnPrefixFromMessage(message)} \nWenn du Hilfe brauchst, dann schreiben einfach ${returnPrefixFromMessage(message)}hilfe 😀`);
        return;
    }
}

var disabledCommandsArray = [];
function disableCommand(message, command)
{
    if(!commandsArray.includes(command)) {message.reply(`Konnte Befehl _${command}_ nicht finden...`)}
    else if(commandIsDisabled(command) == false) 
    {
        disabledCommandsArray.push(command);
        message.channel.send(`Erfolgreiche Deaktivierung von Befehl _${command}_!`);
    }
    else {
        message.channel.send(`Befehl _${command}_ ist bereits deaktiviert`);
    }
}

function enableCommand(message, command) 
{
    if(commandIsDisabled(command) == true) {
        var enabledCommand = 0;

        for(var i = 0; i < disabledCommandsArray.length; i++) 
        {
            var x = disabledCommandsArray[i];
            if(x == command) {disabledCommandsArray[i] = null; enabledCommand = 1;}
        }

        if(enabledCommand == 1) {message.channel.send(`Erfolgreiche Aktivierung von Befehl _${command}_!`);}
        else {message.channel.send(`Aktivierung des Befehls _${command}_ fehlgeschlagen...`);}
    }
    else {
        message.channel.send(`Befehl _${command}_ ist bereits aktiviert`);
    }
}

function commandIsDisabled(command)
{
    var result = false;
    for(var i = 0; i < disabledCommandsArray.length; i++) 
    {
        if(disabledCommandsArray[i] == command) {result = true;}
    }
    return result;
}

var maintenance = 0;
function maintenanceToggle(msg, args) 
{
    if(maintenance == 0 && args[1].toLowerCase() == "an") {
        msg.channel.send(`:warning: Wartungsmodus aktiviert :warning:`)
        maintenance = 1;
        clearTimeout(client.switchRPstatusTimeout);
        setRPstatus("spielt ⚠️ aktuell unter Wartung ⚠️")
    }    
    else if (maintenance == 1 && args[1].toLowerCase() == "aus") {
        msg.channel.send(`:warning: Wartungsmodus deaktiviert :warning:`)
        maintenance = 0;
        switchRPstatus();
    }
    else if(maintenance == 1 && args[1].toLowerCase() == "an" || maintenance == 0 && args[1].toLowerCase() == "aus") 
    {
        msg.reply(`Dieser Modus ist bereits aktiv...`).then(x=>{setTimeout(()=>{x.delete();}, 3000)});
    }
    else {}
}

client.depotsForStatus = function depotsForStatus() {
    if(client.guildSettings["777126331581202444"] != undefined) {        
        var x = Object.keys(client.guildSettings["777126331581202444"].aktien);
        var depots = [];
        
        for (let i = 0; i < x.length; i++) {
            var u = client.guildSettings["777126331581202444"].aktien[x[i]].users;
            for (let z = 0; z < u.length; z++) {
                var e = u[z];
                e = e.slice(0, e.indexOf("|"));
                if(e.length == 18) {if(!depots.includes(e)) {depots.push(e);}}
            }
        }
        
        return `schaut ${depots.length} Depots & ${x.length} Aktien`;
    }
    else {return `schaut 3 Depots & 20 Aktien`;}
}


client.richPresenceStatusListOnStart = [`schaut www.finanzfluss.de`, "schaut X Depots & X Aktien"];
client.richPresenceStatusList = client.richPresenceStatusListOnStart;
client.statusSwitchTime = 10;

client.switchRPstatusTimeout;
client.switchRPstatusCount = 0;

function switchRPstatus() 
{
    var switchTime = client.statusSwitchTime;
    switchTime *= 1000;

    try{
    if(client.switchRPstatusCount >= client.richPresenceStatusList.length) {client.switchRPstatusCount = 0;}

    if(client.richPresenceStatusList[client.switchRPstatusCount] == "schaut X Depots & X Aktien") {client.richPresenceStatusList[client.switchRPstatusCount] = client.depotsForStatus();}

    var richPresenceStatusType = client.richPresenceStatusList[client.switchRPstatusCount].slice(0, client.richPresenceStatusList[client.switchRPstatusCount].indexOf(" "));    
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

function setRPstatus(status) 
{
    var type = status.slice(0, status.indexOf(" "));
    if(type == "schaut") {type = "WATCHING";}
    else if(type == "spielt") {type = "PLAYING";}
    else if(type == "hört") {type = "LISTENING";}

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
    .setColor('#4d6bdd')
    .setFooter(client.user.username + ' Bot', client.user.displayAvatarURL())
    .setAuthor(message.author.tag, message.author.displayAvatarURL())
    .setTimestamp();
    return embed;
}


function timeConverter(UNIX_timestamp)
{
    var a = new Date(UNIX_timestamp);
    var year = a.getFullYear();
    var month = numVal(a.getMonth()+1, 2);//months[a.getMonth()];
    var date = numVal(a.getDate(), 2);
    var hour = a.getHours(); hour = numVal(hour, 2);
    var min = a.getMinutes(); min = numVal(min, 2);
    var sec = a.getSeconds(); sec = numVal(sec, 2);
    var time = date + '.' + month + '.' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
}

function numVal(x, n) 
{
    x = x.toString();
    while(x.length != n && x.length < 10) 
    { x = '0' + x; }
    return x;
}

client.log = 
function log(str, color) {
    var color1 = color;
    if(color == "cyan" || color == "blue") {color = "\x1b[36m";}
    else if(color == "red") {color = "\x1b[31m";}
    else if(color == "green" || color == "lime") {color = "\x1b[32m";}
    else if(color == "yellow" ||color == "orange") {color = "\x1b[33m";}
    else if(color == "magenta" || color == "purple") {color = "\x1b[35m"};

    if(color != undefined && typeof str != "object") {console.log(color,str+ time(),'\x1b[37m');}
    else if(typeof str == "object") {console.log(str); color = "blue";}
    else {console.log(str+ time());}

    var msg = str;
    if(color != undefined) {
        color = color1;
        if(typeof str == "object") {msg = JSON.stringify(str); color = "blue";}
        msg = new Discord.MessageEmbed().setDescription(msg);
        if(color == "yellow") {msg.setColor("YELLOW");}
        else if(color == "green" || color == "lime") {msg.setColor("#33ff11");}
        else if(color == "magenta" || color == "purple") {msg.setColor("PURPLE");}
        else if(color == "blue") {msg.setColor("BLUE");}
        else if(color == "red") {msg.setColor("RED");}
        else if(color == "DARK_AQUA") {msg.setColor("DARK_AQUA");}
        try{client.channels.cache.get("botlogchannel").send(msg);}catch(err) {
            console.error(err); 
            if(typeof str == "object") {client.channels.cache.get(botlogchannel).send(JSON.stringify(str));}
            else {client.channels.cache.get(botlogchannel).send(str);}
        }
    }
    else {        
        if(typeof str == "object") {client.channels.cache.get(botlogchannel).send(JSON.stringify(str));}
        else {client.channels.cache.get(botlogchannel).send(str);}
    }
}

function time() {
    var date = new Date();
    var hours = date.getHours(); hours = numVal(hours, 2);
    var mins = date.getMinutes(); mins = numVal(mins, 2);
    var secs = date.getSeconds(); secs = numVal(secs, 2);
    var ms = date.getMilliseconds(); ms = numVal(ms, 3);
    var timeStamp = " [" + hours + ':' + mins + ':' + secs + ':' + ms + "]"
    return timeStamp;
}


function convertBotUptime(s) 
{
    var botUptimeString = "";

    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hours = (s - mins) / 60;
    var days = 0;
    while(hours > 23) {hours -= 23; days++;}

    if(days > 0) {botUptimeString += `${days}d `;}
    if(hours > 0) {botUptimeString += `${hours}h `;}
    if(mins > 0) {botUptimeString += `${mins}m `;}

    botUptimeString += `${secs}s`;
    return botUptimeString;
}


client.on('error', (err, origin) => {errorHandler(err, origin);});
process.on('uncaughtException', (err, origin) => {errorHandler(err, origin);});
process.on('unhandledRejection', (err, origin) => {errorHandler(err, origin);});

var errorStatus = 0;
var errorTimes = [];

function errorHandler(err, origin) {
    if(errorStatus == 0) {
        errorTimes.push(Date.now());
        if(errorTimes.length > 3) {
            if((errorTimes[errorTimes.length-1] - errorTimes[errorTimes.length-4]) < 3000) {
                client.channels.cache.get(botlogchannel).send("<@"+ client.ownerId+"> An error spam occurred!").then((resultMessage) => {resultMessage.delete();})
                restart();
            }
        }
    }    

    if(errorStatus == 1) {return;}
    else if(err.toString().includes("Missing") && err.toString().includes("Permissions")) {
        try{lastCommandMessageObject.reply(`dieser Befehl konnte aufgrund von fehlenden Rechten nicht korrekt ausgeführt werden...`).then(()=>{})}catch{}
    }
    else if(err.toString().includes("Unknown") && err.toString().includes("Message")) {        
        if(!(err == "DiscordAPIError: Unknown Message" && origin == "[object Promise]"))
        {
            try{
            client.channels.cache.get(botlogchannel).send(`_${err}_\n${dot} Type: ${origin}`);}catch{}
        }
        return;
    }
    else if(err.message == "Cannot send an empty message" && err.name == "DiscordAPIError") {
        if(lastCommandMessageObject != undefined && (lastCommandMessageObject.createdTimestamp + 5000) > (Date.now())) {   
            lastCommandMessageObject.channel.send(`Ups, da ist wohl etwas schiefgelaufen...`);            
        }
        else {}
    }
    else
    {
        try{
        errorStatus = 1;
        if(lastCommandMessageObject != undefined) 
        {
            if(lastCommandMessageObject.createdTimestamp != undefined) {                
                var now = Date.now();
                if((lastCommandMessageObject.createdTimestamp + 5000) > (now)) {
                    if(lastCommandMessageObject == undefined) {
                        lastCommandMessageObject = {content: ""};
                    }
                    else {
                        if(err.toString().includes("empty message")) {return;}
                        lastCommandMessageObject.channel.send(`Ups, da ist wohl etwas schiefgelaufen...`);
                    }
                }
                else {}
            }
        }
                
        var channel = client.channels.cache.get(botlogchannel);
        var embed = new Discord.MessageEmbed()
        .setFooter(timeConverter(Date.now()))
        .setTimestamp()
        .setColor("ff0000")
        .setDescription(`_${err}_\n${dot} Type: ${origin}\n${dot} Message: ${lastCommandMessageObject.content}`)
        channel.send(embed);
        channel.send("<@"+ client.ownerId+"> An error occurred!").then((resultMessage) => {resultMessage.delete();})
        }catch{}

        restart();
    }
}

function restart() 
{
    var channel = client.channels.cache.get(botlogchannel);
    var embed = new Discord.MessageEmbed()
    .setFooter(timeConverter(Date.now()))
    .setTimestamp()
    .setColor("0000ff")    
    .setDescription("restarting")
    channel.send(embed)
    .then(()=> {client.user.setStatus('offline')})
    .then(msg => {
        if(process.platform == 'linux') {client.destroy(); process.exit();}
        else {
            client.destroy(); 
            setTimeout(()=>{
                    client.login(token); setTimeout(init, 500)
            }, 1000);         
        }
    });
}

function shutdown() 
{
    console.log('shutting down...');
    client.user.setStatus('offline').then(() => {
        setTimeout(()=> {client.destroy(); process.exit();}, 1000);
    });
}

function returnPrefixLengthFromMessage(message)
{
    var x = returnPrefixFromMessage(message);
    var prefixLength = x.length;
    return prefixLength;
}

function returnPrefixFromMessage(message)
{
    var result = prefix;
    if(!message.guild) {}
    else if(if2(message.guild.id, "prefix")) {result = client.guildSettings[message.guild.id].prefix; result = unescape(result)}
    return result;
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

client.backupGuildSettings = function backupGuildSettings()
{
    var arr = Object.keys(client.guildSettings);
    var channel = client.channels.cache.get(botbackupchannel);
    channel.send(`** ------------ Backup ${timeConverter(Date.now())} ------------ **`)
    for (let index = 0; index < arr.length; index++) {
        var dir = `./serversettings/${arr[index]}.json`;

        var attachment = new Discord.MessageAttachment(dir);
        channel.send(attachment);
    }    
}


client.checkeAktienKursänderung = async function checkeAktienKursänderung()
{
    try{
    if(new Date().getDay() == 6 || new Date().getDay() == 0) {return;}
    if((new Date().getHours() >= 9 && new Date().getHours() < 21) || new Date().getMinutes() == 0 && new Date().getHours() == 21) {
        var arr = Object.keys(client.guildSettings);  
        for (let index = 0; index < arr.length; index++) {
            if(client.guildSettings[arr[index]].aktien != undefined) {
                var aktien = Object.keys(client.guildSettings[arr[index]].aktien);
                for (let z = 0; z < aktien.length; z++) {

                    var aktie = client.guildSettings[arr[index]].aktien[aktien[z]];
                    var wkn = aktien[z];                    
                    
                    await aktienIntraday(aktie.link).then(intraday => {
                        var link = aktie.link;
                        
                        var msg = "";
                        if(intraday > 0) {
                            msg = `Deine Aktie _${aktie.name}_ hat Intraday bisher ${intraday.replace(".",",")}% gemacht!`;
                        }
                        else if(intraday < 0) {
                            msg = `Deine Aktie _${aktie.name}_ hat Intraday bisher ${intraday.replace(".",",")}% gemacht!`;
                        }
                        //else {return;}

                        if(aktie.users != undefined) {
                            if(aktie.users.length > 0) {
                                var users = aktie.users;
                                for (let i = 0; i < users.length; i++) {
                                    try{
                                        var id = users[i];
                                        id = id.slice(0, id.indexOf("|"));                                    
                                    
                                        if(client.guildSettings[arr[index]] == undefined) {return;}
                                        else if(client.guildSettings[arr[index]][id] == undefined) {return;}
                                        else if(client.guildSettings[arr[index]][id].notify == undefined) {return;}
                                        else if(client.guildSettings[arr[index]][id].percent == undefined && intraday < 5) {return;}
                                        else if(client.guildSettings[arr[index]][id].percent != undefined && ((intraday < 0 && intraday > Number("-"+client.guildSettings[arr[index]][id].percent.replace(",","."))) || ((intraday > 0 && intraday < Number(client.guildSettings[arr[index]][id].percent.replace(",","."))))) )
                                        {
                                            return;
                                        }

                                        if(client.guildSettings[arr[index]][id].notified == undefined) {client.guildSettings[arr[index]][id].notified = [];}
                                        else if(client.guildSettings[arr[index]][id].notified.includes(wkn)) {return;}
                                        else {}

                                        client.guildSettings[arr[index]][id].notified.push(wkn);
                                        client.guilds.cache.get(arr[index]).members.fetch(id).then(x=>{x.send(msg);}).catch(e=>{})
                                        if(!client.saveGuildSettings(arr[index])) {throw `ERROR! aktien änderung ${aktie.name} guild ${arr[index]} user ${id} notify!`}
                                    }
                                    catch(e) {}
                                } 
                            }
                        }
                    });
                }
            }
        }
    }
    }catch(e) {}
}


async function aktienIntraday(shareLink)
{
    var result = await axios.get(`https://www.finanzen.net/${shareLink}`).then(resp=>{
            var htmlText = resp.data;

            var intradayElement = '<span>%</span>';
            var intraday = htmlText.slice(htmlText.indexOf(intradayElement)-99, htmlText.indexOf(intradayElement));
            intraday = intraday.slice(intraday.lastIndexOf(">")+1, intraday.length);
            if(intraday.match(/[^0-9]/g).length > 2) {return undefined;}
            if(intraday.includes(",")) {intraday = intraday.replace(",", ".");}
            return intraday;
        }).catch(e=>{return undefined});
    return result;
}


function resetNotifiedArrays() {
    var arr = Object.keys(client.guildSettings);
    for (let index = 0; index < arr.length; index++) {
        var guildID = arr[index];
        var array = Object.keys(client.guildSettings[guildID]);

        for (let i = 0; i < array.length; i++) {
            var x = array[i];
            if(x.toString().length == 18) {
                if(client.guildSettings[guildID][x].notified != undefined) {
                    if(client.guildSettings[guildID][array[i]].notified.length > 0) {
                        client.guildSettings[guildID][array[i]].notified = [];
                    }
                }
            }   
        }
        client.saveGuildSettings(guildID);
    }
    setTimeout(resetNotifiedArrays, 86400000);
}

function tilNewDay() 
{
    var hoursInSec = (23-new Date().getHours())*60*60*1000;
    var minsInSec = (59-new Date().getMinutes())*60*1000;
    var secInSec = (59-new Date().getSeconds())*1000;
    var time = secInSec+minsInSec+hoursInSec+61000;    
    return time;
}

function tilCheck() 
{
    var min = new Date().getMinutes();
    min = Number(min);
    var minsInSec = (59-min)*60*1000;
    var secInSec = (59-new Date().getSeconds())*1000;
      
    var half = 30*60*1000;    
    var time = secInSec+minsInSec+1000; 

    if((Date.now()+time-half) > Date.now()) {time -= half;}
    
    if(halfOrFullHour(Date.now()+time)) {
        return time;
    }
    else {return "ERROR";}
}

function halfOrFullHour(ms) {
    var t = new Date(ms);
    var result = false;
    if(t.getMinutes() == 0 || t.getMinutes() == 30) {result = true;}
    return result;
}

function schlafToggle(msg, args) 
{
    if(!client.schlaf && args[1].toLowerCase() == "an") {
        msg.channel.send(`Schlaf aktiviert!`)
        client.schlaf = true;
        clearTimeout(client.switchRPstatusTimeout);
        client.user.setPresence({ activity: { name: 'Abwesend' }, status: 'idle' });
    }    
    else if (client.schlaf && args[1].toLowerCase() == "aus") {
        msg.channel.send(`Schlaf deaktiviert!`)
        client.schlaf = false;
        switchRPstatus();
    }
    else if(client.schlaf && args[1].toLowerCase() == "an" || !client.schlaf && args[1].toLowerCase() == "aus") 
    {
        msg.reply(`Dieser Modus ist bereits aktiv...`).then(x=>{setTimeout(()=>{try{x.delete();}catch{}}, 3000)});
    }
    else {}
}

function returnIsAnsweringAtPing(message) 
{
    var result = true;

    if(message.guild && if2(message.guild.id, "pingantwort", 0)) {result = false;}
    return result;
}

client.admin = function returnAdmin(message) {
    var id = message.guild.id;
    var result = false;
    if(message.author.bot) {return result;}    
    if(id == "796381470364925984" || id == "777126331581202444" || id == "708262158458290246") {
        if(message.member.hasPermission("ADMINISTRATOR")) {
            result = true; 
        }
    }
    return result;
}

function uses(id, secs) 
{
    client.uses[id] = {};
    setTimeout(()=>{delete client.uses[id];}, secs*1000);
}