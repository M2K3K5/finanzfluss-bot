module.exports = {
	name: 'aktie',
	guildOnly: false,
	aliases: ["a"],
	async execute(message, args, client, Discord, axios) {
        args.shift();
        var shareName = args.join("-");
        var input = args.join(" ")
        var url = "";
        var shareLink = "";
        var share = {}; 

        var waitMsg = await message.channel.send(`Dies kann einen Moment dauern ...`);     
        var errorSendet = false;
        var waitMsgTimeout = setTimeout(()=>{try{waitMsg.delete();}catch{} message.reply(`ups, da ist wohl etwas schiefgelaufen...`); errorSendet = true;}, 5000);        
        function waitMsgDelete() {if(!errorSendet) {clearTimeout(waitMsgTimeout); try{waitMsg.delete();}catch{} return true;} else {return false;}}
        getWkn();

        

        function getWkn()
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
            else if(shareName.toLowerCase() == "dow" || input.toLowerCase() == "dow jones") {shareName = "969420";}
            else if(shareName.toLowerCase() == "est50" || input.toLowerCase() == "euro stoxx 50") {shareName = "965814";}
            else if(shareName.toLowerCase() == "tdax" || shareName.toLowerCase() == "tecdax") {shareName = "720327";}
            else if(shareName.toLowerCase() == "nas" || shareName.toLowerCase() == "nasdaq") {shareName = "969427";}
            else if(shareName.toLowerCase() == "sp 500" || input.toLowerCase() == "s&p 500") {shareName = "A0AET0";}
            else if(shareName.toLowerCase() == "mdax") {shareName = "846741";}
            else if(shareName.toLowerCase() == "sdax") {shareName = "965338";}

            
            axios.get(`https://www.finanzen.net/suggest/finde/ajax?max_results=2&Keywords_mode=APPROX&query=${shareName}&Keywords=${shareName}&bias=100&target_id=0`).then(resp=>{
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

                    if(arr.length > 5) {                        
                        switch (arr[1]) {
                            case "ETFs":shareLink = "etf/" + arr[arr.length-1].slice(arr[arr.length-1].lastIndexOf("|")+1, arr[arr.length-1].length); break;
                            case "Aktien":shareLink = "aktien/" + arr[arr.length-1].slice(0, arr[arr.length-1].indexOf("|"));break;
                            case "Indizes":shareLink = "index/" + arr[arr.length-1].slice(0, arr[arr.length-1].indexOf("|"));break;
                            case "Rohstoffe":shareLink = "rohstoffe/" + arr[arr.length-1].slice(0, arr[arr.length-1].indexOf("|"));break;
                            case "Fonds":shareLink = "fonds/" + arr[arr.length-1].slice(arr[arr.length-1].lastIndexOf("|")+1, arr[arr.length-1].length);break;
                            case "Devisen":shareLink = "devisen/" + arr[arr.length-1].slice(0, arr[arr.length-1].indexOf("|"));break;                            
                            case "Zertifikate":
                                shareLink = "zertifikate/auf " + 
                                arr[2].slice(arr[2].lastIndexOf("|")+1, arr[2].length) + "/" +
                                arr[arr.length-1].slice(0, arr[arr.length-1].indexOf("|"));
                                while(shareLink.includes(" ")) {shareLink = shareLink.replace(" ", "-");}
                                shareLink = shareLink.toLowerCase();
                                break;
                        }
                        share.name = arr[0];
                        getShare();
                    } 
                    else {if(!waitMsgDelete()) {return;}  message.reply(`Aktie _${input}_ nicht gefunden...`);}
                }
                else {
                    if(!waitMsgDelete()) {return;}                    
                    message.reply(`Aktie _${input}_ nicht gefunden...`);
                }                
            }).catch(e=>{if(!waitMsgDelete()) {return;}  message.reply(`Aktie _${input}_ nicht gefunden...`);});
        }
    
        function getShare()
        {
            axios.get(`https://www.finanzen.net/${shareLink}`).then(resp=>{
                var htmlText = resp.data;
                url = `https://www.finanzen.net/${shareLink}`;

                if(shareLink.startsWith("aktien")) {
                    var embed = returnShare(htmlText);
                    
                    try{getShareNews(embed);}catch(e){embed.addField("Quelle", `[Finanzen.net](${url} 'Hier klicken um die Website zu besuchen')`, true); if(!waitMsgDelete()) {return;} message.reply(embed); }
                }
                else if(shareLink.startsWith("etf")) {
                    var embed = returnEtf(htmlText);

                    try{getShareNews(embed);}catch(e){ embed.addField("Quelle", `[Finanzen.net](${url} 'Hier klicken um die Website zu besuchen')`, true); if(!waitMsgDelete()) {return;} message.reply(embed); }
                }
                else if(shareLink.startsWith("index")) {
                    var embed = returnIndex(htmlText);

                    try{getShareNews(embed);}catch(e){ embed.addField("Quelle", `[Finanzen.net](${url} 'Hier klicken um die Website zu besuchen')`, true); if(!waitMsgDelete()) {return;} message.reply(embed);}
                }
                else if(shareLink.startsWith("rohstoffe")) {
                    var embed = returnRohstoff(htmlText);

                    embed.addField("Quelle", `[Finanzen.net](${url} 'Hier klicken um die Website zu besuchen')`, true); if(!waitMsgDelete()) {return;} message.reply(embed); return;
                }
                else if(shareLink.startsWith("fonds")) {
                    var embed = returnFond(htmlText);

                    try{getShareNews(embed);}catch(e){ embed.addField("Quelle", `[Finanzen.net](${url} 'Hier klicken um die Website zu besuchen')`, true); if(!waitMsgDelete()) {return;} message.reply(embed); }
                }
                else if(shareLink.startsWith("devisen")) {
                    var embed = returnDevise(htmlText);

                    try{getShareNews(embed);}catch(e){ embed.addField("Quelle", `[Finanzen.net](${url} 'Hier klicken um die Website zu besuchen')`, true); if(!waitMsgDelete()) {return;} message.reply(embed); }
                }
                else if(shareLink.startsWith("zertifikate")) {
                    var embed = returnShare(htmlText);

                    embed.addField("Quelle", `[Finanzen.net](${url} 'Hier klicken um die Website zu besuchen')`, true); if(!waitMsgDelete()) {return;} message.reply(embed); return;
                }
            }).catch(e=>{if(!waitMsgDelete()) {return;} message.reply(`Aktie _${input}_ nicht gefunden...`); });
        }

        function returnShare(htmlText)
        {
            var embed = returnEmbedStandards(message)

            var wknElement = '<span class="instrument-id">WKN: ';
            var wkn = htmlText.slice(htmlText.indexOf(wknElement)+wknElement.length, htmlText.indexOf(wknElement)+wknElement.length+20);
            wkn = wkn.slice(0, wkn.indexOf("<"))
            if(wkn.length != 6 || wkn.includes('"') || wkn.includes('=') || wkn.includes(' ')) {wkn = "-";}

            var isinElement = '</span> / ISIN: ';
            var isin = htmlText.slice(htmlText.indexOf(isinElement)+isinElement.length, htmlText.indexOf(isinElement)+isinElement.length+30);
            isin = isin.slice(0, isin.indexOf("<"))
            if(isin.length != 12 || isin.includes('"') || isin.includes('=') || isin.includes(' ')) {isin = "-";}
            
            var symbolElement = '></span> <br> Symbol: ';
            var symbol = htmlText.slice(htmlText.indexOf(symbolElement)+symbolElement.length, htmlText.indexOf(symbolElement)+symbolElement.length+30);
            symbol = symbol.slice(0, symbol.indexOf("<"))

            var euroElement = 'col-xs-5 col-sm-4 text-sm-right text-nowrap">';
            var euro = htmlText.slice(htmlText.indexOf(euroElement)+euroElement.length, htmlText.indexOf(euroElement)+euroElement.length+99);
            euro = euro.slice(0, euro.indexOf("</span>"));
            euro = euro.replace("<span>", " ");
            var einheit = euro.slice(euro.indexOf(" ")+1, euro.length);
            euro = euro.slice(0, euro.indexOf(" "));
            if(euro.match(/[^0-9]/g) != null) {if(euro.match(/[^0-9]/g).length > 2) {euro = "-";} else {euro += " "+einheit;}}
            else {euro += "€";}

            var intradayElement = '<span>%</span>';
            var intraday = htmlText.slice(htmlText.indexOf(intradayElement)-99, htmlText.indexOf(intradayElement));
            intraday = intraday.slice(intraday.lastIndexOf(">")+1, intraday.length);
            if(intraday.includes("&plusmn;")) {intraday = intraday.replace("&plusmn;", "");}
            if(intraday.match(/[^0-9]/g) != null) {
                if(intraday.match(/[^0-9]/g).length > 2) {intraday = "-";}
                else {intraday += "%";}
            }
            else {intraday += "%";}

            var imgElement = ' src="https://c.finanzen.net/cst/';
            var img = htmlText.slice(htmlText.indexOf(imgElement)+imgElement.length-27, htmlText.indexOf(imgElement)+imgElement.length+250);
            img = img.slice(0, img.indexOf('"'));
            img = img.slice(0, img.indexOf('src="'));
            img = img.replace("&amp;style", "&style");
            img = img.replace("&amp;period", "&period");
            while(img.includes(" ")) {img = img.replace(" ", "%20");}

            var imgIntraday = img.replace("mountain_volume_oneyear", "mountain_volume_intraday").replace("period=OneYear", "period=Intraday");

            var historyArray = [];
            var historyText = htmlText.slice(htmlText.indexOf('<th>Zeitraum</th><th>Kurs</th><th>%</th>')-200, htmlText.length);
            historyText = historyText.slice(historyText.indexOf('<table class="table">')+21, historyText.indexOf('</table>'));
            historyText = historyText.split("</td>");
            for(var i = 2; i<historyText.length;i=i+3) {
                var y = historyText[i-2].toString().slice(historyText[i-2].lastIndexOf('>')+1, historyText[i-2].length);
                var x = historyText[i].toString().slice(historyText[i].lastIndexOf('>')+1, historyText[i].length);
                if(x != "-") {historyArray.push(`${y}: ${x}\n`);}
            }
            historyText = historyArray.join("");
            
            var risk = htmlText.slice(htmlText.indexOf('<div class="iconTacho iconTachoMcrs')+35, htmlText.length);
            risk = html_stripe_chars(risk).slice(0, 1);

            embed.addFields(
                {name: "Name:", value: share.name, inline:true},
                {name: "ISIN:", value: isin, inline:true},
                {name: "WKN:", value: wkn, inline:true},
                {name: "Preis", value: euro, inline:true},
                {name: "Intraday:", value: intraday, inline:true}
            )

            if(!isNaN(risk)) {embed.addField(`Moody's Analytik-Risiko-Bewertung`, `${risk}/10${risky(risk)}`, false);}
            if(historyArray.length > 0) {embed.addField("Vergangenheit", historyText, false);}
            if(img.startsWith("http")) {embed.setThumbnail(img);}
            if(imgIntraday.startsWith("http")) {embed.setImage(imgIntraday);}
            
            embed.setTitle(`__Aktie: ${share.name}__`);

            share.risk = risk;        
            share.intraday = intraday;
            share.euro = euro;
            if(!symbol.includes("CacheEngine generated")) {share.symbol = symbol;}
            share.isin = isin;
            share.wkn = wkn;
            share.img = img;
            share.imgIntraday = imgIntraday;
            return embed;
        }

        function getShareNews(embed) 
        {        
            axios.get(`https://www.finanzen.net/news/${shareLink}-news`).then(resp=>{                
                var htmlText = resp.data;
                htmlText = htmlText.slice(htmlText.indexOf('<table class="table news-list">'), htmlText.length)
                htmlText = htmlText.slice(0, htmlText.indexOf('</table>'))

                var arr = htmlText.split("tr>");
                arr.shift();

                var newsField = "";

                if(arr.length > 0) {
                    var limit = 6;
                    var newsCount = 0;
                    for(var i = 0; i < limit; i = i+2) {
                        var x = {};
                        var y = arr[i];
                        x.url = `https://www.finanzen.net/news/${shareLink}-news` + y.slice(y.indexOf('href="')+6, y.length);
                        x.title = x.url;
                        x.url = x.url.slice(0, x.url.indexOf('"')-1);
                        x.title = x.title.slice(x.title.indexOf('>')+1, x.title.indexOf('<'));

                        if(x.title != "" & x.url != "") {newsCount++; newsField += `${newsCount}. [${x.title}](${x.url})\n`;}
                        else if ((limit+2) < arr.length) {limit = limit + 2;}
                    }
                }
                embed.addField("Nachrichten", newsField);
                share.news = newsField;
                embed.addField("Quelle", `[Finanzen.net](${url} 'Hier klicken um die Website zu besuchen')\n\n__Alle Angaben ohne Gewähr!__`, true)

                if(!waitMsgDelete()) {return;}
                message.reply(embed).then(x=>{}).catch(e=>{}); 
            }).catch(e=>{embed.addField("Quelle", `[Finanzen.net](${url} 'Hier klicken um die Website zu besuchen')`, true); if(!waitMsgDelete()) {return;} message.reply(embed)});
        }

        function returnEtf(htmlText)
        {
            var embed = returnEmbedStandards(message)
            
            var wkn = htmlText.slice(htmlText.indexOf(">WKN:</span>")+12, htmlText.indexOf(">WKN:</span>")+18);
            //wkn = wkn.slice(0, wkn.indexOf("<"))
            if(wkn.length != 6 || wkn.includes('"') || wkn.includes('=') || wkn.includes(' ')) {wkn = "-";}

            var isinElement = '<span class="gray">ISIN:</span>';
            var isin = htmlText.slice(htmlText.indexOf(isinElement)+isinElement.length, htmlText.indexOf(isinElement)+isinElement.length+30);
            isin = isin.trim();        
            isin = isin.slice(0, 12);
            if(isin.length != 12 || isin.includes('"') || isin.includes('=') || isin.includes(' ')) {isin = "-";}

            var euroElement = '<th>Kurs</th>';
            var euro = htmlText.slice(htmlText.indexOf(euroElement)+euroElement.length, htmlText.indexOf(euroElement)+euroElement.length+99);            
            euro = euro.slice(euro.indexOf(">")+1, euro.indexOf(" <span"));      
            var einheit = euro.slice(euro.lastIndexOf(" ")+1, euro.length);
            euro = euro.slice(0, euro.lastIndexOf(" "));
            if(euro.match(/[^0-9]/g) != null) {if(euro.match(/[^0-9]/g).length > 3) {euro = "-";} else {euro += " "+einheit;}}
            else {euro += "";}

            var intradayElement = '<span>%</span>';
            var intraday = htmlText.slice(htmlText.indexOf(intradayElement)-99, htmlText.indexOf(intradayElement));
            intraday = intraday.slice(intraday.lastIndexOf(">")+1, intraday.length);
            if(intraday.match(/[^0-9]/g) != null) {
                if(intraday.match(/[^0-9]/g).length > 2) {intraday = "-";}
                else {intraday += "%";}
            }
            else {intraday += "%";}

            var imgElement = ' src="https://c.finanzen.net/cst/';
            var img = htmlText.slice(htmlText.indexOf(imgElement)+imgElement.length-27, htmlText.indexOf(imgElement)+imgElement.length+250);
            img = img.slice(0, img.indexOf('"'));
            img = img.slice(0, img.indexOf('src="'));
            img = img.replace("&amp;style", "&style");
            img = img.replace("&amp;period", "&period");
            while(img.includes(" ")) {img = img.replace(" ", "%20");}

            var imgIntraday = img.replace("mountain_volume_oneyear", "mountain_volume_intraday").replace("period=OneYear", "period=Intraday");

            var historyArray = [];
            var historyText = htmlText.slice(htmlText.indexOf('<th>Zeitraum</th><th>Kurs</th><th>%</th>')-200, htmlText.length);
            historyText = historyText.slice(historyText.indexOf('<table class="table">')+21, historyText.indexOf('</table>'));
            historyText = historyText.split("</td>");
            for(var i = 2; i<historyText.length;i=i+3) {
                var y = historyText[i-2].toString().slice(historyText[i-2].lastIndexOf('>')+1, historyText[i-2].length);
                var x = historyText[i].toString().slice(historyText[i].lastIndexOf('>')+1, historyText[i].length);
                if(x != "-") {historyArray.push(`${y}: ${x}\n`);}
            }
            historyText = historyArray.join("");
            
            var risk = htmlText.slice(htmlText.indexOf('<div class="iconTacho iconTachoMcrs')+35, htmlText.length);
            risk = html_stripe_chars(risk).slice(0, 1);

            embed.addFields(
                {name: "Name:", value: share.name, inline:true},
                {name: "ISIN:", value: isin, inline:true},
                {name: "WKN:", value: wkn, inline:true},
                {name: "Preis", value: euro, inline:true},
                {name: "Intraday:", value: intraday, inline:true}
            )

            if(!isNaN(risk)) {embed.addField(`Moody's Analytik-Risiko-Bewertung`, `${risk}/10${risky(risk)}`, false);}
            if(historyArray.length > 0) {embed.addField("Vergangenheit", historyText, false);}
            if(img.startsWith("http")) {embed.setThumbnail(img);}
            if(imgIntraday.startsWith("http")) {embed.setImage(imgIntraday);}
            embed.setTitle(`__Aktie: ${share.name}__`);

            share.risk = risk;        
            share.intraday = intraday;
            share.euro = euro;
            //if(!symbol.includes("CacheEngine generated")) {share.symbol = symbol;}
            share.isin = isin;
            share.wkn = wkn;
            share.img = img;
            share.imgIntraday = imgIntraday;
            return embed;
        }

        function returnDevise(htmlText)
        {
            var embed = returnEmbedStandards(message)
            var wkn = htmlText.slice(htmlText.indexOf(">WKN:</span>")+12, htmlText.indexOf(">WKN:</span>")+18);
            //wkn = wkn.slice(0, wkn.indexOf("<"))
            if(wkn.length != 6 || wkn.includes('"') || wkn.includes('=') || wkn.includes(' ')) {wkn = "-";}

            var isinElement = '<span class="gray">ISIN:</span>';
            var isin = htmlText.slice(htmlText.indexOf(isinElement)+isinElement.length, htmlText.indexOf(isinElement)+isinElement.length+30);
            isin = isin.trim();        
            isin = isin.slice(0, 12);
            if(isin.length != 12 || isin.includes('"') || isin.includes('=') || isin.includes(' ')) {isin = "-";}

            var euroElement = 'class="col-xs-5 col-sm-4 text-sm-right text-nowrap">';
            var euro = htmlText.slice(htmlText.indexOf(euroElement)+euroElement.length, htmlText.indexOf(euroElement)+euroElement.length+99);
            euro = euro.trim();
            var einheit = euro.slice(euro.indexOf("span>")+5, euro.indexOf("</span>"));
            euro = euro.slice(euro.indexOf("div>")+4, euro.indexOf("<span"));
            euro = euro.slice(0, euro.indexOf(" "));
            if(euro.match(/[^0-9]/g) != null) {if(euro.match(/[^0-9]/g).length > 3) {euro = "-";} else {euro += " "+einheit;}}
            else {euro += "";}

            var intradayElement = '<span>%</span>';
            var intraday = htmlText.slice(htmlText.indexOf(intradayElement)-99, htmlText.indexOf(intradayElement));
            intraday = intraday.slice(intraday.lastIndexOf(">")+1, intraday.length);
            if(intraday.match(/[^0-9]/g) != null) {
                if(intraday.match(/[^0-9]/g).length > 2) {intraday = "-";}
                else {intraday += "%";}
            }
            else {intraday += "%";}

            var imgElement = ' src="https://c.finanzen.net/cst/';
            var img = htmlText.slice(htmlText.indexOf(imgElement)+imgElement.length-27, htmlText.indexOf(imgElement)+imgElement.length+250);
            img = img.slice(0, img.indexOf('"'));
            
            img = img.replace("&amp;style", "&style");
            img = img.replace("&amp;period", "&period");
            while(img.includes("amp;")) {img = img.replace("amp;", "");}
            while(img.includes(" ")) {img = img.replace(" ", "%20");}

            var imgIntraday = img.replace("mountain_year", "mountain_intraday").replace("period=OneYear", "period=IntradayAvailability").replace("300011", "300012");
            var historyArray = [];
            var historyText = htmlText.slice(htmlText.indexOf('<th>Zeitraum</th><th>Kurs</th><th>%</th>')-200, htmlText.length);
            historyText = historyText.slice(historyText.indexOf('<table class="table">')+21, historyText.indexOf('</table>'));
            historyText = historyText.split("</td>");
            for(var i = 2; i<historyText.length;i=i+3) {
                var y = historyText[i-2].toString().slice(historyText[i-2].lastIndexOf('>')+1, historyText[i-2].length);
                var x = historyText[i].toString().slice(historyText[i].lastIndexOf('>')+1, historyText[i].length);
                if(x != "-") {historyArray.push(`${y}: ${x}\n`);}
            }
            historyText = historyArray.join("");
            
            var risk = htmlText.slice(htmlText.indexOf('<div class="iconTacho iconTachoMcrs')+35, htmlText.length);
            risk = html_stripe_chars(risk).slice(0, 1);

            embed.addFields(
                {name: "Name:", value: share.name, inline:true},
                {name: "Preis", value: euro, inline:true},
                {name: "Intraday:", value: intraday, inline:true}
            )

            if(!isNaN(risk)) {embed.addField(`Moody's Analytik-Risiko-Bewertung`, `${risk}/10${risky(risk)}`, false);}
            if(historyArray.length > 0) {embed.addField("Vergangenheit", historyText, false);}
            if(img.startsWith("http")) {embed.setThumbnail(img);}
            if(imgIntraday.startsWith("http")) {embed.setImage(imgIntraday);}
            embed.setTitle(`__Aktie: ${share.name}__`);         

            share.risk = risk;        
            share.intraday = intraday;
            share.euro = euro;
            
            share.isin = isin;
            share.wkn = wkn;
            share.img = img;
            share.imgIntraday = imgIntraday;
            return embed;
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

        function html_stripe_chars(str) 
        {
            str = str.replace(/<[^>]*>/g, '');
            return str;
        }

        function risky(risk) {
            risk = Number(risk);
            if(risk >= 7 && risk <= 10) {return " (hoch :red_circle:)";}
            else if(risk >= 4 && risk <= 6) {return " (mittel :orange_circle:)";}
            else if(risk >= 1 && risk <= 4) {return " (gering :green_circle:)";}
            else {return "";}
        }

        

        function returnFond(htmlText)
        {
            var embed = returnEmbedStandards(message)

            var wknElement = 'WKN:&nbsp;';
            var wkn = htmlText.slice(htmlText.indexOf(wknElement)+wknElement.length, htmlText.indexOf(wknElement)+wknElement.length+20);
            wkn = wkn.slice(0, wkn.indexOf("<")-1)
            if(wkn.length != 6 || wkn.includes('"') || wkn.includes('=') || wkn.includes(' ')) {wkn = "-";}

            var isinElement = 'ISIN:&nbsp;';
            var isin = htmlText.slice(htmlText.indexOf(isinElement)+isinElement.length, htmlText.indexOf(isinElement)+isinElement.length+30);
            isin = isin.slice(0, isin.indexOf("<")-1)
            if(isin.length != 12 || isin.includes('"') || isin.includes('=') || isin.includes(' ')) {isin = "-";}

            var euroElement = 'class="col-xs-5 col-sm-4 text-sm-right text-nowrap">';
            var euro = htmlText.slice(htmlText.indexOf(euroElement)+euroElement.length, htmlText.indexOf(euroElement)+euroElement.length+99);
            euro = euro.slice(0, euro.indexOf("</sp"));
            euro = euro.replace("<span>", " ");
            var einheit = euro.slice(euro.indexOf(" ")+1, euro.length);            
            einheit = einheit.slice(einheit.lastIndexOf(">")+1, einheit.length);
            euro = euro.slice(0, euro.indexOf(" ")).trim();
            euro = euro.slice(0, euro.indexOf("<"));
            if(euro.match(/[^0-9]/g) != null) {if(euro.match(/[^0-9]/g).length > 2) {euro = "-";} else {euro += " "+einheit;}}
            else {euro += "€";}

            var intradayElement = '<span>%</span>';
            var intraday = htmlText.slice(htmlText.indexOf(intradayElement)-99, htmlText.indexOf(intradayElement));
            intraday = intraday.slice(intraday.lastIndexOf(">")+1, intraday.length).trim();
            if(intraday.match(/[^0-9]/g) != null) {
                if(intraday.match(/[^0-9]/g).length > 2) {intraday = "-";}
                else {intraday += "%";}
            }
            else {intraday += "%";}
            

            var imgElement = ' src="https://c.finanzen.net/cst/';
            var img = htmlText.slice(htmlText.indexOf(imgElement)+imgElement.length-27, htmlText.indexOf(imgElement)+imgElement.length+250);
            img = img.slice(0, img.indexOf('"'));
            // img = img.slice(0, img.indexOf('src="'));
            img = img.replace("&amp;style", "&style");
            img = img.replace("&amp;period", "&period");
            while(img.includes("amp;")) {img = img.replace("amp;", "");}
            while(img.includes(" ")) {img = img.replace(" ", "%20");}

            var imgIntraday = img.replace("mountain_year", "mountain_intraday").replace("period=OneYear", "period=IntradayAvailability");

            var historyArray = [];
            var historyText = htmlText.slice(htmlText.indexOf('<th>Zeitraum</th><th>Kurs</th><th>%</th>')-200, htmlText.length);
            historyText = historyText.slice(historyText.indexOf('<table class="table">')+21, historyText.indexOf('</table>'));
            historyText = historyText.split("</td>");
            for(var i = 2; i<historyText.length;i=i+3) {
                var y = historyText[i-2].toString().slice(historyText[i-2].lastIndexOf('>')+1, historyText[i-2].length);
                var x = historyText[i].toString().slice(historyText[i].lastIndexOf('>')+1, historyText[i].length);
                if(x != "-") {historyArray.push(`${y}: ${x}\n`);}
            }
            historyText = historyArray.join("");
            
            var risk = htmlText.slice(htmlText.indexOf('<div class="iconTacho iconTachoMcrs')+35, htmlText.length);
            risk = html_stripe_chars(risk).slice(0, 1);

            embed.addFields(
                {name: "Name:", value: share.name, inline:true},
                {name: "ISIN:", value: isin, inline:true},
                {name: "WKN:", value: wkn, inline:true},
                {name: "Preis", value: euro, inline:true},
                {name: "Intraday:", value: intraday, inline:true}
            )

            if(!isNaN(risk)) {embed.addField(`Moody's Analytik-Risiko-Bewertung`, `${risk}/10${risky(risk)}`, false);}
            if(historyArray.length > 0) {embed.addField("Vergangenheit", historyText, false);}
            if(img.startsWith("http")) {embed.setThumbnail(img);}
            if(imgIntraday.startsWith("http")) {embed.setImage(imgIntraday);}
            
            embed.setTitle(`__Aktie: ${share.name}__`);

            share.risk = risk;        
            share.intraday = intraday;
            share.euro = euro;
            
            share.isin = isin;
            share.wkn = wkn;
            share.img = img;
            share.imgIntraday = imgIntraday;
            return embed;
        }


        function returnRohstoff(htmlText)
        {
            var embed = returnEmbedStandards(message)

            var euroElement = 'class="col-xs-5 col-sm-3 text-sm-right text-nowrap">';
            if(htmlText.split(euroElement).length > 2) {htmlText = htmlText.replace(euroElement, "");}
            var euro = htmlText.slice(htmlText.indexOf(euroElement)+euroElement.length, htmlText.indexOf(euroElement)+euroElement.length+99).trim();
            euro = euro.slice(0, euro.indexOf("</sp"));
            euro = euro.replace("<span>", " ");
            var einheit = euro.slice(euro.indexOf(" ")+1, euro.length);            
            einheit = einheit.slice(einheit.lastIndexOf(">")+1, einheit.length);
            euro = euro.slice(0, euro.indexOf(" ")).trim();
            if(euro.match(/[^0-9]/g) != null) {if(euro.match(/[^0-9]/g).length > 2) {euro = "-";} else {euro += " "+einheit;}}
            else {euro += "€";}

            var intradayElement = '<span>%</span>';
            var intraday = htmlText.slice(htmlText.indexOf(intradayElement)-99, htmlText.indexOf(intradayElement));
            intraday = intraday.slice(intraday.lastIndexOf(">")+1, intraday.length).trim();
            if(intraday.match(/[^0-9]/g) != null) {
                if(intraday.match(/[^0-9]/g).length > 2) {intraday = "-";}
                else {intraday += "%";}
            }
            else {intraday += "%";}
            

            var imgElement = ' src="https://c.finanzen.net/cst/';
            var img = htmlText.slice(htmlText.indexOf(imgElement)+imgElement.length-27, htmlText.indexOf(imgElement)+imgElement.length+250);
            img = img.slice(0, img.indexOf('"'));
            // img = img.slice(0, img.indexOf('src="'));
            img = img.replace("&amp;style", "&style");
            img = img.replace("&amp;period", "&period");
            while(img.includes("amp;")) {img = img.replace("amp;", "");}
            while(img.includes(" ")) {img = img.replace(" ", "%20");}

            var imgIntraday = img.replace("mountain_year", "mountain_intraday").replace("period=OneYear", "period=IntradayAvailability");

            var historyArray = [];
            var historyText = htmlText.slice(htmlText.indexOf('<th>Zeitraum</th><th>Kurs</th><th>%</th>')-200, htmlText.length);
            historyText = historyText.slice(historyText.indexOf('<table class="table">')+21, historyText.indexOf('</table>'));
            historyText = historyText.split("</td>");
            for(var i = 2; i<historyText.length;i=i+3) {
                var y = historyText[i-2].toString().slice(historyText[i-2].lastIndexOf('>')+1, historyText[i-2].length);
                var x = historyText[i].toString().slice(historyText[i].lastIndexOf('>')+1, historyText[i].length);
                if(x != "-") {historyArray.push(`${y}: ${x}\n`);}
            }
            historyText = historyArray.join("");
            
            var risk = htmlText.slice(htmlText.indexOf('<div class="iconTacho iconTachoMcrs')+35, htmlText.length);
            risk = html_stripe_chars(risk).slice(0, 1);

            embed.addFields(
                {name: "Name:", value: share.name, inline:true},
                {name: "Preis", value: euro, inline:true},
                {name: "Intraday:", value: intraday, inline:true}
            )

            if(!isNaN(risk)) {embed.addField(`Moody's Analytik-Risiko-Bewertung`, `${risk}/10${risky(risk)}`, false);}
            if(historyArray.length > 0) {embed.addField("Vergangenheit", historyText, false);}
            if(img.startsWith("http")) {embed.setThumbnail(img);}
            if(imgIntraday.startsWith("http")) {embed.setImage(imgIntraday);}
            
            embed.setTitle(`__Aktie: ${share.name}__`);

            share.risk = risk;        
            share.intraday = intraday;
            share.euro = euro;
            
            share.img = img;
            share.imgIntraday = imgIntraday;
            return embed;
        }

        
        function returnIndex(htmlText)
        {
            var embed = returnEmbedStandards(message)
            
            var wknElement = '<span class="instrument-id">WKN: ';
            var wkn = htmlText.slice(htmlText.indexOf(wknElement)+wknElement.length, htmlText.indexOf(wknElement)+wknElement.length+20);
            wkn = wkn.slice(0, wkn.indexOf("<")-1)
            if(wkn.length != 6 || wkn.includes('"') || wkn.includes('=') || wkn.includes(' ')) {wkn = "-";}

            var isinElement = '</span> / ISIN: ';
            var isin = htmlText.slice(htmlText.indexOf(isinElement)+isinElement.length, htmlText.indexOf(isinElement)+isinElement.length+30);
            isin = isin.slice(0, isin.indexOf("<")-1)
            if(isin.length != 12 || isin.includes('"') || isin.includes('=') || isin.includes(' ')) {isin = "-";}
            
            var euroElement = 'class="col-xs-5 col-sm-4 text-sm-right text-nowrap">';
            var euro = htmlText.slice(htmlText.indexOf(euroElement)+euroElement.length, htmlText.indexOf(euroElement)+euroElement.length+99);
            euro = euro.slice(0, euro.indexOf("</span>")).trim();
            euro = euro.replace("<span>", " ");
            var einheit = euro.slice(euro.indexOf(" ")+1, euro.length);
            euro = euro.slice(0, euro.indexOf(" "));
            if(euro.match(/[^0-9]/g) != null) {if(euro.match(/[^0-9]/g).length > 2) {euro = "-";} else {euro += " "+einheit;}}
            else {euro += "€";}

            var intradayElement = '<span>%</span>';
            var intraday = htmlText.slice(htmlText.indexOf(intradayElement)-99, htmlText.indexOf(intradayElement));
            intraday = intraday.slice(intraday.lastIndexOf(">")+1, intraday.length).trim();
            if(intraday.includes("&plusmn;")) {intraday = intraday.replace("&plusmn;", "");}
            if(intraday.match(/[^0-9]/g) != null) {
                if(intraday.match(/[^0-9]/g).length > 2) {intraday = "-";}
                else {intraday += "%";}
            }
            else {intraday += "%";}

            var imgElement = ' src="https://c.finanzen.net/cst/';
            var img = htmlText.slice(htmlText.indexOf(imgElement)+imgElement.length-27, htmlText.indexOf(imgElement)+imgElement.length+250);
            img = img.slice(0, img.indexOf('"'));
            img = img.slice(0, img.indexOf('src="'));
            img = img.replace("&amp;style", "&style");
            img = img.replace("&amp;period", "&period");
            while(img.includes(" ")) {img = img.replace(" ", "%20");}

            var imgIntraday = img.replace("mountain_volume_oneyear", "mountain_volume_intraday").replace("period=OneYear", "period=Intraday");

            var historyArray = [];
            var historyText = htmlText.slice(htmlText.indexOf('<th>Zeitraum</th><th>Kurs</th><th>%</th>')-200, htmlText.length);
            historyText = historyText.slice(historyText.indexOf('<table class="table">')+21, historyText.indexOf('</table>'));
            historyText = historyText.split("</td>");
            for(var i = 2; i<historyText.length;i=i+3) {
                var y = historyText[i-2].toString().slice(historyText[i-2].lastIndexOf('>')+1, historyText[i-2].length);
                var x = historyText[i].toString().slice(historyText[i].lastIndexOf('>')+1, historyText[i].length);
                if(x != "-") {historyArray.push(`${y}: ${x}\n`);}
            }
            historyText = historyArray.join("");
            
            var risk = htmlText.slice(htmlText.indexOf('<div class="iconTacho iconTachoMcrs')+35, htmlText.length);
            risk = html_stripe_chars(risk).slice(0, 1);

            embed.addFields(
                {name: "Name:", value: share.name, inline:true},
                {name: "ISIN:", value: isin, inline:true},
                {name: "WKN:", value: wkn, inline:true},
                {name: "Preis", value: euro, inline:true},
                {name: "Intraday:", value: intraday, inline:true}
            )

            if(historyArray.length > 0) {embed.addField("Vergangenheit", historyText, false);}
            if(img.startsWith("http")) {embed.setThumbnail(img);}
            if(imgIntraday.startsWith("http")) {embed.setImage(imgIntraday);}
            
            embed.setTitle(`__Aktie: ${share.name}__`);

            share.risk = risk;        
            share.intraday = intraday;
            share.euro = euro;
            
            share.isin = isin;
            share.wkn = wkn;
            share.img = img;
            share.imgIntraday = imgIntraday;
            return embed;
        }
	},
};
