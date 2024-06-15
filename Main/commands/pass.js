const Discord = require('discord.js');
const client = new Discord.Client();
const {SCOP, SERVİCES_FİLES, SAMPLE_ID, token } = require('../../config/config.json')
const { google } = require('googleapis');
const { execute } = require('./slot');

const SCOPES =SCOP;
const SERVICE_ACCOUNT_FILE = SERVİCES_FİLES;
const SAMPLE_SPREADSHEET_ID = SAMPLE_ID;

const START_ROW = 3;
const END_ROW = 22;
const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: SCOP,
});

client.once('ready', () => {
    console.log('Bot çalışıyor!');
});

async function updateGun2TeamNames(contents) {
    try {
        const clientAuth = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: clientAuth });

        
        const reversedContents = contents.reverse().map(content => [content]);

        const ranges = [
            `Scrim & Tournuments!B${START_ROW}:B${START_ROW + reversedContents.length - 1}`
        ];

        for (const range of ranges) {
            console.log(`Güncellenecek aralık: ${range}`);
            console.log('Güncellenecek içerikler:', reversedContents);

            const result = await sheets.spreadsheets.values.update({
                spreadsheetId: SAMPLE_SPREADSHEET_ID,
                range: range,
                valueInputOption: 'RAW',
                resource: {
                    values: reversedContents
                },
            });

            console.log(`Güncellenen hücre sayısı: ${result.data.updatedCells}`);
            if (result.data.updatedCells === 0) {
                console.error('Hücreler güncellenemedi. Lütfen aralığı ve verilerin doğruluğunu kontrol edin.');
            } else {
                console.log(`${result.data.updatedCells} hücre başarıyla güncellendi.`);
            }
        }
    } catch (error) {
        console.error('Google Sheets API Hatası:', error);
    }
}

module.exports = {
    name: 'pass',
    description: 'Pass dağıtır, Slota yazar.',
    async execute(message, args) {
        if (!message.member.hasPermission('ADMINISTRATOR')) {
            return message.reply('Bu komutu kullanmaya yetkiniz yok!');
        }
        if (message.mentions.channels.size !== 1) {
            return message.reply('Lütfen bir kanal etiketleyin!');
        }

        const channel = message.mentions.channels.first();
        if (!args.length) {
            return message.reply('Lütfen bir rol etiketleyin!');
        }

        const role = message.mentions.roles.first();
        if (!role) {
            return message.reply('Belirtilen rol bulunamadı!');
        }

        const contents = []; 

        try {
            const messages = await channel.messages.fetch();
            for (const msg of messages.values()) {
                const user = await client.users.fetch(msg.author.id).catch(console.error);
                if (user && msg.reactions.cache.some(reaction => reaction.emoji.name === '✅' && !reaction.me)) {
                    try {
                        const member = await message.guild.members.fetch(user).catch(console.error);
                        if (member) {
                            await member.roles.add(role).catch(console.error);
                            contents.push(msg.content); 
                            console.log(`Tik atılan mesajın içeriği: ${msg.content}`);
                            console.log(`Rol verildi: ${role.name} - Kullanıcı: ${user.tag}`);
                        }
                    } catch (error) {
                        console.error('Rol verme hatası:', error);
                    }
                }
            }

            if (contents.length > 0) {
                try {
                    await updateGun2TeamNames(contents);
                } catch (e) {
                    console.error("Güncelleme hatası:", e);
                }
            } else {
                console.log("Güncellenecek içerik yok.");
            }

            message.channel.send(`${role.name} rolü, ${channel.name} kanalındaki mesajlara "✅" reaksiyonu eklenen tüm kullanıcılara verildi!`);
        } catch (error) {
            console.error('Hata:', error);
            message.channel.send('Bir hata oluştu!');
        }
    },
};

client.login(token).catch(console.error);
