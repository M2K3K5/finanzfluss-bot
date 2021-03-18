module.exports = {
    name: 'depot',
    aliases: ["d"],
	guildOnly: false,
	async execute(message, args, client, Discord, axios) {
        if(args[0].toLowerCase() == "d" && args.length == 1) {args[1] = "ansicht"}
        else {args[0] = "depot";}

        if(args[1] == undefined) {message.reply(`du hast keine Option angegeben ... Verfügbare Optionen: hinzufügen/entfernen/auflisten/server/einstellungen`)}
        else if(args[1].toLowerCase() == "hinzufügen" || args[1].toLowerCase() == "add" || args[1] == "+") {
            if(args.length > 2) {
                var waitMsg = await message.channel.send(`Dies kann einen Moment dauern ...`);                
                var preis = 0;
                var aktie = args;
                aktie.shift();
                aktie.shift();
                
                if(aktie.length > 1) {
                    if(aktie[aktie.length-1].match(/[^0-9]/g) != null) {
                        if(aktie[aktie.length-1].match(/[^0-9]/g).length == 1 && aktie[aktie.length-1].match(/[^0-9]/g)[0] == ",") {                            
                            var nachkommaStelle = aktie[aktie.length-1].slice(aktie[aktie.length-1].indexOf(",")+1, aktie[aktie.length-1].length);

                            if(nachkommaStelle.length > 2) {
                                try{waitMsg.delete();}catch{} 
                                message.reply(`die Aktie wurde **__nicht__** deinem Depot hinzugefügt! Der Preis darf maximal 2 Nachkommastellen haben...`); 
                                return;
                            }

                            aktie[aktie.length-1] = aktie[aktie.length-1].replace(",",".");
                        }
                    }
                    if(aktie[aktie.length-1].match(/[^0-9]/g) == null || (aktie[aktie.length-1].match(/[^0-9]/g).length == 1 && aktie[aktie.length-1].match(/[^0-9]/g)[0] == ".")) {
                        preis = aktie[aktie.length-1]; 
                        aktie.pop(); 
                        if(preis <= 0) {try{waitMsg.delete();}catch{} message.reply(`die Aktie wurde **__nicht__** deinem Depot hinzugefügt! Du musst einen Preis größer als 0 wählen...`); return;}
                        else {
                            preis = preis.replace(".", ","); 
                        }
                    }
                }
                aktie = aktie.join(" ");
                var input = aktie;

                getWkn(aktie).then(aktie => {
                    if(aktie == false || aktie == undefined || aktie == "undefined") {try{waitMsg.delete();}catch{} message.reply(`_${input}_ konnte nicht gefunden werden. Bitte überprüfe deine Angaben ...`); return;}
                    var arr = aktie.split(" | ");
                    aktie = arr[0];
                    var name = arr[1];
                    if(name.includes("div class=")) {message.reply(`_${input}_ konnte nicht richtig gefunden werden. Bitte versuche anderen Angaben ...`); return;}
                    var link = arr[2];


                    if(client.guildSettings['777126331581202444'] == undefined) {client.guildSettings['777126331581202444'] = {};}
                    if(client.guildSettings['777126331581202444'].aktien == undefined) {client.guildSettings['777126331581202444'].aktien = {};}
                    if(client.guildSettings['777126331581202444'].aktien[aktie] == undefined) {
                        client.guildSettings['777126331581202444'].aktien[aktie] = {name: name, link: link, users: []}; 
                    }
                    if(shareHasUser(message.author.id, aktie)) {try{waitMsg.delete();}catch{} message.reply(`_${client.guildSettings['777126331581202444'].aktien[aktie].name}_ befindet sich bereits in deinem Depot!`); return;}


                    var arr2 = Object.keys(client.guildSettings['777126331581202444'].aktien);
                    var aktienAnzahl = 0;
                    for (let i = 0; i < arr2.length; i++) {if(shareHasUser(message.author.id, arr2[i])) {aktienAnzahl++;}}
                    if(aktienAnzahl >= 10) {message.reply(`du hast bereits 10 Aktien im Depot! Bitte entferne mind. eine, wenn du ${name} deinem Depot hinzufügen möchtest`); try{waitMsg.delete();}catch{} return;}

                    aktienDaten(link).then(daten=>{
                        var startPreisGegeben = true;
                        if(preis == 0) {preis = daten[0]; startPreisGegeben = false;}
                        client.guildSettings['777126331581202444'].aktien[aktie].users.push(message.author.id+`|${preis}`);

                        var addedViewable = false;

                        var x = client.guildSettings['777126331581202444'];
                        if(x[message.author.id] == undefined) {x[message.author.id] = {};}
                        if(x[message.author.id].viewable == undefined)  {x[message.author.id].viewable = "An"; addedViewable = true;}
                        client.guildSettings['777126331581202444'] = x;

                        try{waitMsg.delete();}catch{}
                        if(client.saveGuildSettings('777126331581202444')) {
                            var r = "";
                            if(startPreisGegeben) {r = `die Aktie _${name}_ wurde deinem Depot mit dem Preis _${preis}_ hinzugefügt!`;}
                            else {r = `die Aktie _${name}_ wurde deinem Depot hinzugefügt!`;}

                            if(aktienAnzahl == 0 && addedViewable) {

                                r += `\nDeine Depot Sichtbarkeit für andere Mitglieder ist automatisch aktiviert. Falls du dem widersprichst, reagiere jetzt mit ❌`;
                                message.reply(r).then(resultMessage=>{
                                    resultMessage.react("❌").catch(e=>{});                        
                                
                                    resultMessage.awaitReactions((reaction, user) => reaction.emoji.name === '❌' && user.id === message.author.id, {max: 1, time: 60*1000 })
                                    .then(collected => {
                                        if(collected.size != 0) {
                                            var x = collected.array()[0].users.cache.array();
                                            for (let i = 0; i < x.length; i++) {x[i] = x[i].id;}
                    
                                            if(x.includes(message.author.id)) {
                                                var x = client.guildSettings['777126331581202444'];                                            

                                                if(x[message.author.id] != undefined) {
                                                    if(x[message.author.id].viewable != undefined) {delete x[message.author.id].viewable;}
                                                    if(Object.keys(x[message.author.id]).length == 0) {delete x[message.author.id];}
                                                }
                            
                                                client.guildSettings['777126331581202444'] = x;
                                                if(client.saveGuildSettings('777126331581202444')) {
                                                    message.reply(`dein Depot ist nun nur noch für dich sichbar!`).then(x=>{setTimeout(()=>{x.delete();}, 5000)}).catch(e=>{client.error(e)});                                                    
                                                }
                                                else {message.reply(`ups, da ist wohl etwas schiefgelaufen...`);}
                                            }
                                            else {}                                            
                                        }
                                        resultMessage.reactions.removeAll().catch(e=> {resultMessage.reactions.resolve("❌").users.remove(client.user.id);});
                                        resultMessage.edit(resultMessage.content.replace("Deine Depot Sichtbarkeit für andere Mitglieder ist automatisch aktiviert. Falls du dem widersprichst, reagiere jetzt mit ❌", ""))
                                    })
                                    .catch(e=>{});                                    
                                });
                            }
                            else {message.reply(r);}
                        }
                        else {message.reply(`ups, da ist wohl etwas schiefgelaufen...`); }   
                    }).catch(e=>{try{waitMsg.delete();}catch{} message.reply(`ups, da ist wohl etwas schiefgelaufen...`);});
                });
            }
            else {try{waitMsg.delete();}catch{} message.reply(`bitte gebe eine Aktie/WKN an ...`)}
        }



        else if(args[1].toLowerCase() == "entfernen" || args[1].toLowerCase() == "remove" || args[1] == "-") {
            if(args.length > 2) {
                var waitMsg = await message.channel.send(`Dies kann einen Moment dauern ...`);
                var aktie = args;
                aktie.shift();
                aktie.shift();
                aktie = aktie.join(" ");
                var input = aktie;

                getWkn(aktie).then(aktie => {
                var arr = aktie.split(" | ");
                aktie = arr[0];
                
                if(client.guildSettings['777126331581202444'].aktien == undefined) {try{waitMsg.delete();}catch{} message.reply(`du hast ${arr[1]} nicht in deinem Depot!`); return;}
                else if(client.guildSettings['777126331581202444'].aktien[aktie] == undefined) {try{waitMsg.delete();}catch{} message.reply(`du hast ${arr[1]} nicht in deinem Depot!`); return;}
                else if(shareHasUser(message.author.id, aktie)) {
                    var name = client.guildSettings['777126331581202444'].aktien[aktie].name;
                    var arr1 = client.guildSettings['777126331581202444'].aktien[aktie].users;
                    var arr2 = [];
                    for (let index = 0; index < arr1.length; index++) {if(!arr1[index].includes(message.author.id)) {arr2.push(arr1[index]);}}

                    if(arr2.length > 0) {client.guildSettings['777126331581202444'].aktien[aktie].users = arr2;}
                    else {delete client.guildSettings['777126331581202444'].aktien[aktie];}
                    
                    try{waitMsg.delete();}catch{}
                    if(client.saveGuildSettings('777126331581202444')) {message.reply(`_${name}_ wurde erfolgreich aus deinem Depot entfernt!`);}
                    else {message.reply(`ups, da ist wohl etwas schiefgelaufen...`);}
                }
                else {try{waitMsg.delete();}catch{} message.reply(`du hast ${arr[1]} nicht in deinem Depot!`); }
                });
            }
            else {try{waitMsg.delete();}catch{} message.reply(`bitte gebe eine Aktie/WKN an ...`)}
        }


        else if(args[1].toLowerCase() == "schließen") {
            if(client.guildSettings['777126331581202444'] == undefined || client.guildSettings['777126331581202444'].aktien == undefined || Object.keys(client.guildSettings['777126331581202444'].aktien).length <= 0) {
                message.reply(`du hast keine Aktien im Depot...`);
                return;
            }
                        
            var id = message.author.id;
            var tag = message.author.tag;        
            
            var waitMsg = await message.channel.send(`Dies kann einen Moment dauern ...`);
            var x = client.guildSettings['777126331581202444'].aktien;
            var arr = Object.keys(x);
            var aktienAnzahl = 0;

            for (let index = 0; index < arr.length; index++) {
                var wkn = arr[index];
                var name = x[wkn].name;

                if(shareHasUser(id, wkn)) {
                    var a2 = [];
                    for (let index2 = 0; index2 < x[wkn].users.length; index2++) {
                        var userID = x[wkn].users[index2];
                        userID = userID.slice(0, userID.indexOf("|"));
                        if(userID == id) {aktienAnzahl++;}
                        else {a2.push(x[wkn].users[index2]);}
                    }
                    x[wkn].users = a2;
                }   
            }

            try{waitMsg.delete();}catch{}
            if(client.saveGuildSettings('777126331581202444')) {
                if(aktienAnzahl > 0) {message.reply(`dein Depot mit ${aktienAnzahl} Aktien wurde geschlossen!`);}
                else {message.reply(`du hast keine Aktien im Depot...`);}
            }
            else {message.reply(`ups, da ist wohl etwas schiefgelaufen...`);}
            return;
        }



        else if(args[1].toLowerCase() == "auflisten" || args[1].toLowerCase() == "ansicht") {
            if(client.guildSettings['777126331581202444'] == undefined || client.guildSettings['777126331581202444'].aktien == undefined || Object.keys(client.guildSettings['777126331581202444'].aktien).length <= 0) {
                if(message.mentions.users.first() != undefined) {message.reply(`${message.mentions.users.first().tag} hat keine Aktien im Depot...`);}
                else if(message.author.id == id) {message.reply(`du hast keine Aktien im Depot...`); }
                else {message.reply(`konnte den User nicht finden!`);}
                return;
            }
                        
            var id = message.author.id;
            var tag = message.author.tag;

            if(args[2] != undefined) {
                if(args[2].length == 21) {args[2] = args[2].replace("<@", ""); args[2] = args[2].replace(">", ""); }
                else if(args[2].length == 22) {args[2] = args[2].replace("<@!", ""); args[2] = args[2].replace(">", ""); }

                if(args[2].length == 18 && !isNaN(args[2])) {
                    id = args[2]; 

                    var u = await client.users.fetch(id).catch(e=>{u = undefined;})
                    if(u == undefined || u.size != undefined) {message.reply(`konnte den User nicht finden!`); return;}
                    tag = u.tag;

                    if(client.guildSettings['777126331581202444'] != undefined ) {
                        if(client.guildSettings['777126331581202444'][id] != undefined && client.guildSettings['777126331581202444'][id].viewable == undefined || client.guildSettings['777126331581202444'][id] == undefined) {
                            if(message.author.id != id) {
                                message.reply(`${tag} besitzt kein Depot oder es ist nicht sichtbar für dich!`);
                                return;
                            }
                        }
                    }
                }
                else {message.reply(`ungültige User ID/Erwähnung! (Eine User ID ist 18 Zeichen lang und besteht nur aus Zahlen)`); return;}
            }
            
            var waitMsg = await message.channel.send(`Dies kann einen Moment dauern ...`);
            var x = client.guildSettings['777126331581202444'].aktien;
            var arr = Object.keys(x);
            var description = "";
            var tooLong = false;
            var aktienAnzahl = 0;

            for (let index = 0; index < arr.length; index++) {
                var wkn = arr[index];
                var name = x[wkn].name;

                if(shareHasUser(id, wkn)) {
                    for (let index2 = 0; index2 < x[wkn].users.length; index2++) {
                        try{
                            var userID = x[wkn].users[index2];
                            userID = userID.slice(0, userID.indexOf("|"));
                            var startPreis = x[wkn].users[index2].slice(x[wkn].users[index2].indexOf("|")+1, x[wkn].users[index2].length);
                            
                            if(userID == id && !tooLong) {
                                var d = await aktienDaten(x[wkn].link)

                                var preis = gesamt = intraday = "-";
                                var einheit = "";

                                if(d != undefined) {
                                    preis = d[0];
                                    intraday = d[1] + "%";
                                    einheit = d[2];
                                    while(preis.includes(".")) {preis = preis.replace(".", "");}
                                    while(startPreis.includes(".")) {startPreis = startPreis.replace(".", "");}
                                    if(preis.includes(",")) {preis = preis.replace(",", ".");}
                                    if(startPreis.includes(",")) {startPreis = startPreis.replace(",", ".");}
                                    gesamt = Number(preis)/Number(startPreis);
                                    gesamt = ((gesamt*100).toFixed(1)-100).toFixed(1) +"%";
                                    if(preis.includes(".")) {preis = preis.replace(".", ",");}
                                }
                                else {}

                                //var x1 = `${aktienAnzahl}. ${name} (WKN: ${wkn})\n`;
                                aktienAnzahl++;
                                var x2 = `${aktienAnzahl}. ${name}, Preis: ${preis} ${einheit}, Intraday: ${intraday}, Ges.: ${gesamt}, WKN: ${wkn}\n`;
                                if((description.length+77+x2.length) >= 2048) {description += "\n\n..."; tooLong = true;}
                                //else if(d == undefined) {description += x1}
                                else {description += x2; }
                            }   
                        }catch(e) {}
                    }
                }   
            }

            try{waitMsg.delete();}catch{}
            if(description.length == 0) {
                if(id != undefined && id == message.author.id) {message.reply(`du hast keine Aktien in deinem Depot...`); }
                else if(tag != undefined && id != message.author.id) {message.reply(`${tag} hat keine Aktien in deinem Depot...`); }
                else {message.reply(`der User hat keine Aktien im Depot...`); }
                return;
            }

            var embed = returnEmbedStandards(message)
            .setTitle(`Depot von ${tag}`)
            .setDescription(`__**Folgende Aktien befinden sich im Depot von ${tag}:**__\n\n` + description)
            .addField("\u200B", "__Alle Angaben ohne Gewähr!__");

            message.channel.send(embed);
        }


        else if(args[1].toLowerCase() == "server" || args[1].toLowerCase() == "s") {
            if(client.guildSettings['777126331581202444'] == undefined || client.guildSettings['777126331581202444'].aktien == undefined || Object.keys(client.guildSettings['777126331581202444'].aktien).length <= 0) {
                message.reply(`es hat noch kein Servermitglied dieses Servers Aktien im Depot...`); return;
            }

            var waitMsg = await message.channel.send(`Dies kann einen Moment dauern ...`);
            var x = client.guildSettings['777126331581202444'].aktien;
            var arr = Object.keys(x);
            var description = [""];

            var besitzerArr = [];
            for (let index = 0; index < arr.length; index++) {
                var wkn = arr[index];
                var name = x[wkn].name;
                var anzahl = Number(x[wkn].users.length);
                if(anzahl > 0) {besitzerArr.push(`${anzahl}|${name} (WKN: ${wkn}) (Besitzer: ${anzahl})\n`);}
                else {delete client.guildSettings['777126331581202444'].aktien[wkn];}
            }
            
            besitzerArr.sort();
            besitzerArr.reverse();

            for (let index = 0; index < besitzerArr.length; index++) {
                var z = besitzerArr[index];
                z = `${index+1}. ` + z.slice(z.indexOf("|")+1, z.length);
                if(!tooLong && ((description[description.length-1].length + 75 + z.length) >= 2038)) {description.push("");}
                description[description.length-1] += z; 
            }

            try{waitMsg.delete();}catch{}
            if(description[0].length == 0) {message.reply(`es hat noch kein Servermitglied dieses Servers Aktien im Depot...`); return;}

            for (let i = 0; i < description.length; i++) {                
                var embed = new Discord.MessageEmbed()
                .setColor('#4d6bdd');

                if(i == 0) {
                embed.setFooter("")
                .setTitle(`Übersicht alle Depots`)
                .setDescription(`__**Folgende Aktien stammen aus den Depots aller Depotinhaber:**__\n\n` + description[0])
                .setAuthor(message.author.tag, message.author.displayAvatarURL())
                }
                else {
                    embed.setDescription(description[i]);
                    if(i == description.length-1) {
                        embed.setFooter(`Alle Angaben ohne Gewähr!\n${client.user.username} Bot`, client.user.displayAvatarURL())
                        .setTimestamp()
                    }
                }

                message.channel.send(embed);
            }

            client.saveGuildSettings('777126331581202444');
        }





        else if(args[1].toLowerCase() == "einstellungen" || args[1].toLowerCase() == "settings" || args[1].toLowerCase() == "einst") {
            if(client.guildSettings['777126331581202444'] == undefined) {client.guildSettings['777126331581202444'] = {};}
            
            var x = client.guildSettings['777126331581202444'];
            var embed = returnEmbedStandards(message);

            if(args[2] == undefined) {
                if(x[message.author.id] == undefined || x[message.author.id].notify == undefined) {embed.addField("Benachrichtigung bei 5% Intraday Kursänderung", "Aus");}
                else if(x[message.author.id].notify != undefined && x[message.author.id].percent == undefined) {embed.addField("Benachrichtigung bei 5% Intraday Kursänderung", x[message.author.id].notify);}
                else if(x[message.author.id].notify != undefined) {embed.addField(`Benachrichtigung bei ${x[message.author.id].percent}% Intraday Kursänderung`, x[message.author.id].notify);}
                
                if(x[message.author.id] == undefined || x[message.author.id].viewable == undefined) {embed.addField("Depot ist sichtbar für Servermitglieder", "Aus");}
                else if(x[message.author.id].viewable != undefined) {embed.addField("Depot ist sichtbar für Servermitglieder", x[message.author.id].viewable);}

                message.channel.send(embed);
            }
            else if(args[2].toLowerCase() == "benachrichtigung" || args[2].toLowerCase() == "b") {
                if(args[3] == undefined) {message.reply(`du hast keine verfügbare Option angegeben ... Verfügbare Optionen: f!depot einstellungen benachrichtigung [an/aus] (Intraday Kursänderung in %)`);}
                else if(args[3].toLowerCase() == "an") {                    
                    if(x[message.author.id] == undefined) {x[message.author.id] = {};}
                    x[message.author.id].notify = "An"; 
                    var percent = 5;

                    if(args[4] != undefined) {
                        var four = args[4];                        
                        if(four.match(/[^0-9]/g) != null) {
                            if(four.match(/[^0-9]/g).length == 1 && four.match(/[^0-9]/g)[0] == ",") {
                                var nachkommaStelle = four.slice(four.indexOf(",")+1, four.length);
                                
                                if(nachkommaStelle.length > 1) {try{waitMsg.delete();}catch{} message.reply(`Benachrichtigung **nicht** geändert! Du darfst maximal eine Nachkommastelle für die Kursänderung angeben...`); return;}
                                four = four.replace(",",".");
                            }
                        }
                        if(four.match(/[^0-9]/g) == null || (four.match(/[^0-9]/g).length == 1 && four.match(/[^0-9]/g)[0] == ".")) {
                            if(four <= 0 || four > 100) {try{waitMsg.delete();}catch{} message.reply(`Benachrichtigung **nicht** geändert! Du musst eine Kursänderung zwischen 1-100 wählen...`); return;}
                            else {
                                four = args[4];
                                percent = four;
                                x[message.author.id].percent = percent;
                            }
                        }
                    }

                    client.guildSettings['777126331581202444'] = x;
                    if(client.saveGuildSettings('777126331581202444')) {message.reply(`du wirst nun bei ${percent}% Intraday Kursänderung benachrichtigt!`);}
                    else {message.reply(`ups, da ist wohl etwas schiefgelaufen...`); } 
                }
                else if(args[3].toLowerCase() == "aus") {                      
                    if(x[message.author.id] != undefined) {if(x[message.author.id].notify != undefined) {delete x[message.author.id].notify;}}
                    if(x[message.author.id] != undefined) {if(x[message.author.id].percent != undefined) {delete x[message.author.id].percent;}}
                    if(Object.keys(x[message.author.id]).length == 0) {delete x[message.author.id];}

                    client.guildSettings['777126331581202444'] = x;
                    if(client.saveGuildSettings('777126331581202444')) {message.reply(`du wirst nicht mehr bei 5% Intraday Kursänderung benachrichtigt!`);}
                    else {message.reply(`ups, da ist wohl etwas schiefgelaufen...`); }
                }
            }

            else if(args[2].toLowerCase() == "sichtbar" || args[2].toLowerCase() == "s") {
                if(args[3] == undefined) {message.reply(`du hast keine verfügbare Option angegeben ... Verfügbare Optionen: f!depot einstellungen sichtbar [an/aus]`);}
                else if(args[3].toLowerCase() == "an") {
                    if(x[message.author.id] == undefined) {x[message.author.id] = {};}
                    x[message.author.id].viewable = "An";

                    client.guildSettings['777126331581202444'] = x;
                    if(client.saveGuildSettings('777126331581202444')) {message.reply(`dein Depot ist nun für alle sichbar!`);}
                    else {message.reply(`ups, da ist wohl etwas schiefgelaufen...`); } 
                }
                else if(args[3].toLowerCase() == "aus") {
                    if(x[message.author.id] != undefined) {
                        if(x[message.author.id].viewable != undefined) {delete x[message.author.id].viewable;}
                        if(Object.keys(x[message.author.id]).length == 0) {delete x[message.author.id];}
                    }

                    client.guildSettings['777126331581202444'] = x;
                    if(client.saveGuildSettings('777126331581202444')) {message.reply(`dein Depot ist nun nur noch für dich sichbar!`);}
                    else {message.reply(`ups, da ist wohl etwas schiefgelaufen...`);}
                }
                else {message.reply(`du hast keine verfügbare Option angegeben ... Verfügbare Optionen: f!depot einstellungen sichtbar [an/aus]`);}
            }
            else {message.reply(`du hast keine verfügbare Option angegeben ... Verfügbare Optionen: f!depot einstellungen (benachrichtigung/sichtbar)`);}
        
        }
        else {message.reply(`du hast keine verfügbare Option angegeben ... Verfügbare Optionen: hinzufügen/entfernen/auflisten/server/einstellungen`);}


        async function getWkn(shareName)
        {
            if(shareName.toLowerCase() == "bitcoin" || shareName.toLowerCase() == "btc") {shareName = "F123457";}
            else if(shareName.toLowerCase() == "bitcoin cash" || shareName.toLowerCase() == "bch" || shareName.toLowerCase() == "bcc") {shareName = "F654322";}
            else if(shareName.toLowerCase() == "dogecoin" || shareName.toLowerCase() == "doge") {shareName = "FINEURDOGE";}
            else if(shareName.toLowerCase() == "ethereum" || shareName.toLowerCase() == "eth") {shareName = "F123480";}
            else if(shareName.toLowerCase() == "ripple" || shareName.toLowerCase() == "xrp") {shareName = "FINXRPEUR";}
            else if(shareName.toLowerCase() == "litecoin" || shareName.toLowerCase() == "ltc") {shareName = "F123560";}
            else if(shareName.toLowerCase() == "eos" || shareName.toLowerCase() == "eos") {shareName = "FINEUREOS";}
            else if(shareName.toLowerCase() == "dash") {shareName = "FINDSHUSD";}
            else if(shareName.toLowerCase() == "gold") {shareName = "Goldpreis";}
            else if(shareName.toLowerCase() == "silber") {shareName = "Silberpreis";}
            else if(shareName.toLowerCase() == "platin") {shareName = "Platinpreis";}
            else if(shareName.toLowerCase() == "dax") {shareName = "846900";}
            else if(shareName.toLowerCase() == "dow" || shareName.toLowerCase() == "dow jones") {shareName = "969420";}
            else if(shareName.toLowerCase() == "est50" || shareName.toLowerCase() == "euro stoxx 50") {shareName = "965814";}
            else if(shareName.toLowerCase() == "tdax" || shareName.toLowerCase() == "tecdax") {shareName = "720327";}
            else if(shareName.toLowerCase() == "nas" || shareName.toLowerCase() == "nasdaq") {shareName = "969427";}
            else if(shareName.toLowerCase() == "sp 500" || shareName.toLowerCase() == "s&p 500") {shareName = "A0AET0";}
            else if(shareName.toLowerCase() == "mdax") {shareName = "846741";}
            else if(shareName.toLowerCase() == "sdax") {shareName = "965338";}
            
            var x = axios.get(`https://www.finanzen.net/suggest/finde/ajax?max_results=2&Keywords_mode=APPROX&query=${shareName}&Keywords=${shareName}&bias=100&target_id=0`).then(resp=>{
                    var htmlText = resp.data;
                    if(htmlText.includes('new Array(new Array("')) {
                        htmlText = htmlText.replace('mmSuggestDeliver(0, new Array("Name", "Category", "Keywords", "Bias", "Extension", "IDs"), new Array(', "");
                        htmlText = htmlText.slice(0, htmlText.length-9);
                        var arr = htmlText.split("new Array");
                        arr.shift();
                        while(arr[0].includes('<div') && arr[0].includes('class=')) {arr.shift();}
                        arr = arr[0];
                        arr = arr.slice(1, arr.length-1);
                        arr = arr.split(', ');
                        for (let i = 0; i < arr.length; i++) {arr[i] = arr[i].slice(1, arr[i].length-1);}
                        
                        var wkn = link = name = "";
    
                        if(arr.length > 5) {                        
                            switch (arr[1]) {
                                case "Aktien":
                                    link = "aktien/" + arr[arr.length-1].slice(0, arr[arr.length-1].indexOf("|"));
                                    wkn = arr[2].slice(0, arr[2].indexOf("|"));
                                    name = arr[0];
                                    break;
                                case "Indizes":
                                    link = "index/" + arr[arr.length-1].slice(0, arr[arr.length-1].indexOf("|"));
                                    wkn = arr[2].slice(0, arr[2].indexOf("|"));
                                    name = arr[0];
                                    break;
                                case "Rohstoffe":
                                    link = "rohstoffe/" + arr[arr.length-1].slice(0, arr[arr.length-1].indexOf("|"));
                                    wkn = arr[2].slice(0, arr[2].indexOf("|"));
                                    name = arr[0];
                                    break;
                                case "Devisen":
                                    link = "devisen/" + arr[arr.length-1].slice(0, arr[arr.length-1].indexOf("|"));
                                    wkn = arr[2].slice(0, arr[2].indexOf("|"));
                                    name = arr[0];
                                    break;            
                                case "ETFs":
                                    link = "etf/" + arr[arr.length-1].slice(arr[arr.length-1].lastIndexOf("|")+1, arr[arr.length-1].length); 
                                    wkn = arr[2].slice(0, arr[2].indexOf("|"));
                                    name = arr[0];
                                    break;              
                                case "Fonds":
                                    link = "fonds/" + arr[arr.length-1].slice(arr[arr.length-1].lastIndexOf("|")+1, arr[arr.length-1].length);
                                    wkn = arr[2].slice(0, arr[2].indexOf("|"));
                                    name = arr[0];
                                    break;  
                                case "Zertifikate":
                                    link = "zertifikate/auf " + 
                                    arr[2].slice(arr[2].lastIndexOf("|")+1, arr[2].length) + "/" +
                                    arr[arr.length-1].slice(0, arr[arr.length-1].indexOf("|"));
                                    while(link.includes(" ")) {link = link.replace(" ", "-");}
                                    link = link.toLowerCase();
                                    wkn = arr[arr.length-1].slice(0, arr[arr.length-1].indexOf("|"));
                                    name = arr[0];
                                    break;
                            }
                            
                            shareName = wkn + " | " + name + " | " + link;
                            return shareName;
                        } 
                    }
                    else {return false;}
                    
                }).catch(e=>{ return false;});

            return x;
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

        async function aktienDaten(shareLink)
        {
            var result = await axios.get(`https://www.finanzen.net/${shareLink}`).then(resp=>{
                    var htmlText = resp.data;
                    var d = [];

                    if(shareLink.startsWith("aktien")) {
                        d = returnShare(htmlText);
                        if(!d.includes(undefined)) {return d;}
                        else {return undefined}
                    }
                    else if(shareLink.startsWith("etf")) {
                        d = returnEtf(htmlText);
                        if(!d.includes(undefined)) {return d;}
                        else {return undefined}
                    }
                    else if(shareLink.startsWith("index")) {
                        d = returnIndex(htmlText);
                        if(!d.includes(undefined)) {return d;}
                        else {return undefined}
                    }
                    else if(shareLink.startsWith("rohstoffe")) {
                        d = returnRohstoff(htmlText);
                        if(!d.includes(undefined)) {return d;}
                        else {return undefined}
                    }
                    else if(shareLink.startsWith("fonds")) {
                        d = returnFond(htmlText);
                        if(!d.includes(undefined)) {return d;}
                        else {return undefined}
                    }
                    else if(shareLink.startsWith("devisen")) {
                        d = returnDevise(htmlText);
                        if(!d.includes(undefined)) {return d;}
                        else {return undefined}
                    }
                    else if(shareLink.startsWith("zertifikate")) {return undefined}
                    
                }).catch(e=>{ return undefined});
            return result;
        }

        function shareHasUser(id, aktie)
        {
            var guildID = '777126331581202444';

            result = false;
            var arr = client.guildSettings[guildID].aktien[aktie].users;
            for (let index = 0; index < arr.length; index++) {
                var user = arr[index];
                user = user.slice(0, user.indexOf("|"));
                
                if(user == id) {result = true;}
            }
            return result;
        }
        
        function returnShare(htmlText)
        {
            var euroElement = 'col-xs-5 col-sm-4 text-sm-right text-nowrap">';
            var euro = htmlText.slice(htmlText.indexOf(euroElement)+euroElement.length, htmlText.indexOf(euroElement)+euroElement.length+99);
            euro = euro.slice(0, euro.indexOf("</span>"));
            euro = euro.replace("<span>", " ");
            var einheit = euro.slice(euro.indexOf(" ")+1, euro.length);
            euro = euro.slice(0, euro.indexOf(" "));
            if(euro.match(/[^0-9]/g) != null) {if(euro.match(/[^0-9]/g).length > 2) {euro = undefined;} /*else {euro += " "+einheit;}*/}
            //else {euro += "€";}

            var intradayElement = '<span>%</span></div><div';
            var intraday = htmlText.slice(htmlText.indexOf(intradayElement)-99, htmlText.indexOf(intradayElement));
            intraday = intraday.slice(intraday.lastIndexOf(">")+1, intraday.length);
            if(intraday.match(/[^0-9]/g) != null) {
                if(intraday.match(/[^0-9]/g).length > 2) {intraday = undefined;}
                //else {intraday += "%";}
            }
            //else {intraday += "%";}
            
            return [euro, intraday, einheit]
        }
        
        function returnEtf(htmlText)
        {
            var euroElement = '<th>Kurs</th>';
            var euro = htmlText.slice(htmlText.indexOf(euroElement)+euroElement.length, htmlText.indexOf(euroElement)+euroElement.length+99);            
            euro = euro.slice(euro.indexOf(">")+1, euro.indexOf(" <span"));     
            var einheit = euro.slice(euro.lastIndexOf(" ")+1, euro.length);
            euro = euro.slice(0, euro.lastIndexOf(" "));
            if(euro.match(/[^0-9]/g) != null) {
                if(euro.match(/[^0-9]/g).length > 3) {euro = undefined;} 
                //else {euro += " "+einheit;}
            }
            //else {euro += "";}

            var intradayElement = '<span>%</span>';
            var intraday = htmlText.slice(htmlText.indexOf(intradayElement)-99, htmlText.indexOf(intradayElement));
            intraday = intraday.slice(intraday.lastIndexOf(">")+1, intraday.length);
            if(intraday.match(/[^0-9]/g) != null) {
                if(intraday.match(/[^0-9]/g).length > 2) {intraday = undefined;}
                //else {intraday += "%";}
            }
            //else {intraday += "%";}
            
            return [euro, intraday, einheit]
        }

        function returnDevise(htmlText)
        {
            var euroElement = 'class="col-xs-5 col-sm-4 text-sm-right text-nowrap">';
            var euro = htmlText.slice(htmlText.indexOf(euroElement)+euroElement.length, htmlText.indexOf(euroElement)+euroElement.length+99);
            euro = euro.trim();
            var einheit = euro.slice(euro.indexOf("span>")+5, euro.indexOf("</span>"));
            euro = euro.slice(euro.indexOf("div>")+4, euro.indexOf("<span"));
            euro = euro.slice(0, euro.indexOf(" "));
            if(euro.match(/[^0-9]/g) != null) {
                if(euro.match(/[^0-9]/g).length > 3) {euro = undefined;} 
                //else {euro += " "+einheit;}
            }

            var intradayElement = '<span>%</span>';
            var intraday = htmlText.slice(htmlText.indexOf(intradayElement)-99, htmlText.indexOf(intradayElement));
            intraday = intraday.slice(intraday.lastIndexOf(">")+1, intraday.length);
            if(intraday.match(/[^0-9]/g) != null) {
                if(intraday.match(/[^0-9]/g).length > 2) {intraday = undefined;}
                //else {intraday += "%";}
            }
            //else {intraday += "%";}
            
            return [euro, intraday, einheit]
        }
        
        function returnFond(htmlText)
        {
            var euroElement = 'class="col-xs-5 col-sm-4 text-sm-right text-nowrap">';
            var euro = htmlText.slice(htmlText.indexOf(euroElement)+euroElement.length, htmlText.indexOf(euroElement)+euroElement.length+99);
            euro = euro.slice(0, euro.indexOf("</sp"));
            euro = euro.replace("<span>", " ");
            var einheit = euro.slice(euro.indexOf(" ")+1, euro.length);            
            einheit = einheit.slice(einheit.lastIndexOf(">")+1, einheit.length);
            euro = euro.slice(0, euro.indexOf(" ")).trim();
            euro = euro.slice(0, euro.indexOf("<"));
            if(euro.match(/[^0-9]/g) != null) {
                if(euro.match(/[^0-9]/g).length > 2) {euro = undefined;} 
                //else {euro += " "+einheit;}
            }
            else {euro += "€";}

            var intradayElement = '<span>%</span>';
            var intraday = htmlText.slice(htmlText.indexOf(intradayElement)-99, htmlText.indexOf(intradayElement));
            intraday = intraday.slice(intraday.lastIndexOf(">")+1, intraday.length).trim();
            if(intraday.match(/[^0-9]/g) != null) {
                if(intraday.match(/[^0-9]/g).length > 2) {intraday = undefined;}
                //else {intraday += "%";}
            }
            //else {intraday += "%";}
            
            return [euro, intraday, einheit]
        }
        
        function returnRohstoff(htmlText)
        {
            var euroElement = 'class="col-xs-5 col-sm-3 text-sm-right text-nowrap">';
            if(htmlText.split(euroElement).length > 2) {htmlText = htmlText.replace(euroElement, "");}
            var euro = htmlText.slice(htmlText.indexOf(euroElement)+euroElement.length, htmlText.indexOf(euroElement)+euroElement.length+99).trim();
            euro = euro.slice(0, euro.indexOf("</sp"));
            euro = euro.replace("<span>", " ");
            var einheit = euro.slice(euro.indexOf(" ")+1, euro.length);            
            einheit = einheit.slice(einheit.lastIndexOf(">")+1, einheit.length);
            euro = euro.slice(0, euro.indexOf(" ")).trim();
            if(euro.match(/[^0-9]/g) != null) {
                if(euro.match(/[^0-9]/g).length > 2) {
                        euro = undefined;
                }
                //else {euro += " "+einheit;}
            }
            else {euro += "€";}

            var intradayElement = '<span>%</span>';
            var intraday = htmlText.slice(htmlText.indexOf(intradayElement)-99, htmlText.indexOf(intradayElement));
            intraday = intraday.slice(intraday.lastIndexOf(">")+1, intraday.length).trim();
            if(intraday.match(/[^0-9]/g) != null) {
                if(intraday.match(/[^0-9]/g).length > 2) {intraday = undefined;}
                else {intraday += "%";}
            }
            //else {intraday += "%";}
            
            return [euro, intraday, einheit]
        }
        
        
        function returnIndex(htmlText)
        {
            var euroElement = 'class="col-xs-5 col-sm-4 text-sm-right text-nowrap">';
            var euro = htmlText.slice(htmlText.indexOf(euroElement)+euroElement.length, htmlText.indexOf(euroElement)+euroElement.length+99);
            euro = euro.slice(0, euro.indexOf("</span>")).trim();
            euro = euro.replace("<span>", " ");
            var einheit = euro.slice(euro.indexOf(" ")+1, euro.length);
            euro = euro.slice(0, euro.indexOf(" "));
            if(euro.match(/[^0-9]/g) != null) {
                if(euro.match(/[^0-9]/g).length > 2) {euro = undefined;} 
                //else {euro += " "+einheit;}
            }
            //else {euro += "€";}

            var intradayElement = '<span>%</span>';
            var intraday = htmlText.slice(htmlText.indexOf(intradayElement)-99, htmlText.indexOf(intradayElement));
            intraday = intraday.slice(intraday.lastIndexOf(">")+1, intraday.length).trim();
            if(intraday.includes("&plusmn;")) {intraday = intraday.replace("&plusmn;", "");}
            if(intraday.match(/[^0-9]/g) != null) {
                if(intraday.match(/[^0-9]/g).length > 2) {
                    intraday = undefined;
                }
                else {intraday += "%";}
            }
            //else {intraday += "%";}
            
            return [euro, intraday, einheit]
        }
	},
};
