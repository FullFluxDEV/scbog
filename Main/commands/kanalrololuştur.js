const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const { google } = require('googleapis');
const { SCOP, SERVİCES_FİLES, SAMPLE_ID, YetkiliroleId, token } = require('../../config/config.json');
const { createCanvas, loadImage, registerFont } = require('canvas');
const { name, description, execute } = require('./live');

client.once('ready', () => {
    console.log('Aktif');
});

const SCOPES = SCOP;
const SERVICE_ACCOUNT_FILE = SERVİCES_FİLES;
const SAMPLE_SPREADSHEET_ID = SAMPLE_ID;

const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: SCOPES,
});

function replaceTurkishCharacters(teamName) {
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

    teamName = teamName.replace(/[ıİşŞğĞüÜöÖçÇ]/g, function (match) {
        return turkishCharacters[match];
    });

    return teamName;
}

async function createChannelsEmbed(action, roleName, progress) {
    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`Kanal Oluşturma İşlemi (${action})`)
        .setDescription(`${progress}\n\`${roleName}\` adında bir rol ve ona ait bir metin ve ses kanalı oluşturuldu.`)
        .setTimestamp();

    return embed;
}

async function createCategory(guild, categoryName) {
    const category = await guild.channels.create(categoryName, {
        type: 'category',
        permissionOverwrites: [
            {
                id: guild.id,
                deny: ['VIEW_CHANNEL'],
            },
            {
                id: YetkiliroleId, 
                allow: ['VIEW_CHANNEL'],
            },
        ],
    });
    return category;
}

async function sendMessageToTextChannel(guild, textChannelName, messageContent) {
    const channel = guild.channels.cache.find(channel => channel.name === textChannelName && channel.type === 'text');
    if (!channel) {
        console.error(`Metin kanalı bulunamadı: ${textChannelName}`);
        return;
    }

    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setDescription(messageContent)
        .setFooter('Fbı Scrim Bot');

    channel.send(embed);
}

async function Data() {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SAMPLE_SPREADSHEET_ID,
        range: 'Scrim & Tournuments!B3:B29',
    });
    return response.data.values;
}

module.exports = {
    name: 'kanaloluştur',
    description: 'Ses, moss, rol oluşturur.',
    async execute(message, args) {
        const data = await Data();
        const categoryName = args.join(' ') || 'Yeni Kategori Adı';
        const statusMessage = await message.channel.send(`Kanallar ve roller oluşturuluyor, kategori: ${categoryName}...`);
        
        const category = await createCategory(message.guild, categoryName);
        let progress = '';

        for (let i = 0; i < data.length; i++) {
            const originalRoleName = data[i][0];
            const roleName = replaceTurkishCharacters(originalRoleName).replace(/\s/g, '-').toUpperCase();
            const role = await message.guild.roles.create({
                data: {
                    name: originalRoleName,
                    color: 'BLUE',
                },
                reason: 'New role needed'
            });

            const textChannel = await message.guild.channels.create(roleName, {
                type: 'text',
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: message.guild.id,
                        deny: ['VIEW_CHANNEL'],
                    },
                    {
                        id: role.id,
                        allow: ['VIEW_CHANNEL'],
                    },
                ],
            });

            const voiceChannel = await message.guild.channels.create(`💎| ${roleName}`, {
                type: 'voice',
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: message.guild.id,
                        deny: ['VIEW_CHANNEL'],
                    },
                    {
                        id: role.id,
                        allow: ['VIEW_CHANNEL'],
                    },
                ],
            });

            const içerik = '!ekiprolu <@kullanıcıidsi>';
            await sendMessageToTextChannel(message.guild, textChannel.name, `Merhaba! Bu ${roleName} kanalına hoş geldiniz.\n Burada sizlere verdiğimiz bazı komutlar var.\n Bu komutları kullanabilmek için Geliştirici modu açmalısınız\nGeliştirici mod nasıl açılır;\nAyarlar->Gelişmiş->Geliştirici Mod\nArtık ${içerik}\nŞeklinde oyuncularınıza rol verebilirsiniz\nEkip oyuncularınıza rol verebilirsiniz`);

            progress += `\nRol: ${roleName}, Metin Kanalı: ${textChannel.name}, Ses Kanalı: ${voiceChannel.name}`;

            const embed = await createChannelsEmbed('Oluşturuluyor', roleName, progress);
            await statusMessage.edit('', embed);
        }

        const finalEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Kanal Oluşturma İşlemi Tamamlandı')
            .setDescription(`Tüm belirtilen roller ve kanallar başarıyla oluşturuldu, kategori: ${categoryName}.`)
            .setTimestamp()
            .setFooter(`İşlemi gerçekleştiren: ${message.author.tag}`, message.author.displayAvatarURL());

        await statusMessage.edit('', finalEmbed);
        console.log('All roles and channels created.');
    },
};

client.login(token);
