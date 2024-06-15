const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const { yantablo, yantablo2, live, live2, result, result2, mvp, mvp2, slot, slot2, win } = require('../../config/tabloisim.json')
const { google } = require('googleapis');
const { live_e_tablo, SCOP, SERVİCES_FİLES, SAMPLE_ID, livekanalId , puansistemi} = require('../../config/config.json')
const {  LiveX, LiveY, LivelogonunIsimdenUzakliğiX, LivelogonunIsimdenUzakliğiY, LivelogoBuyuklugu } = require('../../config/kordinat.json')
const { createCanvas, loadImage, registerFont } = require('canvas');

const SCOPES = SCOP;
const SERVICE_ACCOUNT_FILE = SERVİCES_FİLES;
const SAMPLE_SPREADSHEET_ID = SAMPLE_ID;


const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: SCOPES,
});


async function Data() {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SAMPLE_SPREADSHEET_ID,
      range: live_e_tablo,
    });
    return response.data.values;
}


function replaceTurkishCharacters(teamName) {
  if (!teamName) return '';
  if (!teamName) return '';
    const turkishCharacters = {
        'ı': 'i',
        'İ': 'I',
        'ş': 's',
        'Ş': 'S',
        'ğ': 'g',
        'Ğ': 'G',
        'ü': 'u',
        'Ü': 'U',
        'ö': 'o',
        'Ö': 'O',
        'ç': 'c',
        'Ç': 'C',
    };

    return teamName.replace(/[ıİşŞğĞüÜöÖçÇ]/g, function (match) {
        return turkishCharacters[match];
    });
}

async function updateGun2TeamNames(teamNames) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const resource = {
      values: teamNames.map(name => [name]) // takım isimlerini yay
  };

  const live_e_tablo = [
    'Scrim & Tournuments!B3:M22'
  ];

  const promises = live_e_tablo.map(range => sheets.spreadsheets.values.update({
    spreadsheetId: SAMPLE_SPREADSHEET_ID,
    range: range,
    valueInputOption: 'RAW',
    resource: resource,
  }));

  await Promise.all(promises);
}



async function getTeamNames() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SAMPLE_SPREADSHEET_ID,
      range: live_e_tablo,
  });

  const data = response.data.values || [];
  const teamNames = data.map(row => row[0]); // takım adlarını alıyosun baby

  return teamNames;
}
async function someEventHandler() {
  try {
    const client = await auth.getClient(); 
    const sheets = google.sheets({ version: 'v4', auth: client }); 

    const promises = live_e_tablo.map(range => sheets.spreadsheets.values.get({
      spreadsheetId: SAMPLE_SPREADSHEET_ID,
      range: range,
    }));

  
    const responses = await Promise.all(promises);

    
    const allData = responses.reduce((acc, response) => {
      const data = response.data.values || [];
      return acc.concat(data);
    }, []);

    
    return allData;
  } catch (error) {
    console.error('Data retrieval failed:', error);
    throw error; 
  }
}

async function settingsData() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SAMPLE_SPREADSHEET_ID,
    range: live_e_tablo,
  });
  return response.data.values;
}

module.exports = {
  name: 'live',
  description: 'Live tablosu oluşturut.',
  async execute(message, args) {
    // ---------
    var desingno = false;
    var segmentedno = false;
    var canvas = createCanvas(1760, 990);
    var context = canvas.getContext('2d');
    data = await someEventHandler();
    console.log(data)
    registerFont('../font/x.ttf', { family: 'American Captain'})
    context.fillStyle = '#ffffff';
    context.font = '24px American Captain';
    

    
    const backgroundImagePath = args[0] === '2' ? `../Tablolar/${live2}` : `../Tablolar/${live}`;

    const backgroundImage = await loadImage(backgroundImagePath);


    context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    try {

        // var teamNames = await getTeamNames();
        // await updateGun2TeamNames(teamNames);
        var x = await settingsData()
      if (data && data.length > 0) {
        var teams = {};
        const puanlar = [0]   
        for(let i = 0; i < 20; i++){
            puanlar.push(puansistemi[i])
        }
        
        for (let i = 0; i < data.length; i++) {
            
            
            
          var teamName = replaceTurkishCharacters(data[i][0]) || "";
          if (!teams[teamName]) {
            teams[teamName] = { totalPuan: 0, totalKill: 0, totalSira: 0, winCount: 0 };
          }
          
          for (let j = 0; j < 5; j++) {
            let kill = parseInt(data[i][2 + (j * 2)]) || 0;
            let sira = parseInt(data[i][3 + (j * 2)]) || 0;

            
            if (!isNaN(kill) && !isNaN(sira)) {
              let totalPuan = 0;
                if (sira == 1) {
                    totalPuan = puansistemi[1];
                    sira = 15
                    teams[teamName].winCount++;
                  } 
                  else if (sira == 2) {
                    totalPuan = puansistemi[2];
                    sira = 12
                  } 
                  else if (sira == 3) {
                    totalPuan = puansistemi[3];
                    sira = 10
                  } 
                  else if (sira == 4) {
                    totalPuan = puansistemi[4];
                    sira = 8
                  } 
                  else if (sira == 5) {
                    totalPuan = puansistemi[5];
                    sira = 6
                  } 
                  else if (sira == puansistemi[6]) {
                    totalPuan = 4;
                    sira = 4
                  } 
                  else if (sira == puansistemi[7]) {
                    totalPuan =2;
                    sira = 2
                  } 
                  else {
                    totalPuan = 0
                    sira = 0
                  }
              
              teams[teamName].totalPuan += parseInt(kill) + parseInt(sira)
              teams[teamName].totalKill += kill;
              teams[teamName].totalSira += sira;
              
            }
          }
        }
        var sortedTeams = Object.entries(teams).sort((a, b) => b[1].totalPuan - a[1].totalPuan);
        const embed = new Discord.MessageEmbed()
        .setTitle('Sonuçlar')
        .setDescription(' 👑 Tebrikler');
        for (let i = 0; i < 3 && i < sortedTeams.length; i++) {
          const [teamName, teamData] = sortedTeams[i];
          embed.addField(`#${i + 1} - ${teamName} 👑`, `Toplam Puan: ${teamData.totalPuan} 👑`);
        }
        for (const [teamName, teamData] of Object.entries(teams)) {
        }

        context.textAlign = 'left';
        var spaceOfNameKill = 400
        var spaceOfKillSira = 80
        var spaceOfSiraTotal = 80
        
        for (let index = 0; index < sortedTeams.length; index++) {
          const [teamName, teamData] = sortedTeams[index];
        
          if (teamName.trim() !== "") {
            var teamNameX = LiveX[index]
            var initialY = LiveY[index]
        
            try {
              context.fillText(teamName, teamNameX, initialY); // takım adı
              context.fillText(teamData.totalSira, teamNameX + spaceOfNameKill, initialY); // kill
              context.fillText(teamData.totalKill, teamNameX + spaceOfNameKill + spaceOfKillSira, initialY); // sira
              context.fillText(teamData.totalPuan, teamNameX + spaceOfNameKill + spaceOfKillSira + spaceOfSiraTotal, initialY ); // total
              try {
                const logo = await loadImage(`./Logolar/${teamName}.png`);
                context.drawImage(logo, teamNameX- LivelogonunIsimdenUzakliğiX , initialY-LivelogonunIsimdenUzakliğiY, LivelogoBuyuklugu[0], LivelogoBuyuklugu[1]);
              } catch (error) {
                var logosuzlar = []
                logosuzlar.push(teamName) 
              }

              if (teamData.winCount >= 1) {
                const winnerLogo = await loadImage(`../Tablolar/${win}`);
                context.fillText(`X${teamData.winCount}`, teamNameX + 270 , initialY)
                context.drawImage(winnerLogo , teamNameX + 300, initialY - 36, 50, 50);
              }
            } catch (error) {
              continue; 
            }

          }
        }

        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'result.png');
        embed.attachFiles([attachment]);
        embed.setImage('attachment://result.png');

        
        const sentMessage = await message.channel.send(embed);

        await sentMessage.react('✅');

        const filter = (reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id;

        const collector = sentMessage.createReactionCollector(filter, { time: 30000 });

        collector.on('collect', async (reaction, user) => {
            try {
                const channel = message.guild.channels.cache.get(livekanalId);
                if (channel) {
                    await channel.send(embed);
                    message.channel.send('Embed başarıyla belirtilen kanala gönderildi.');
                } else {
                    throw new Error('Belirtilen kanal bulunamadı.');
                }
            } catch (error) {
                console.error('Hata:', error);
                message.channel.send('Bir hata oluştu.');
            }
        });

        collector.on('end', () => {
           message.channel.send('Tike tıklama süreniz bitti.');
        });

      }
    } catch (error) {
      console.error('Hata:', error);
      message.channel.send('Bir hata oluştu.');
    }
  }
}

