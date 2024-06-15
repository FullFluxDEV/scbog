const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const { google, compute_alpha } = require('googleapis');
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

async function createChannelsEmbed(message, action, roleName) {
    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`Kanal Oluşturma İşlemi (${action})`)
        .setDescription(`\`${roleName}\` adında bir rol ve ona ait bir metin ve ses kanalı oluşturuldu.`)
        .addField('Rol Oluşturuldu', roleName)
        .addField('Metin Kanalı Oluşturuldu', roleName)
        .addField('Ses Kanalı Oluşturuldu', roleName)
        .setTimestamp()
        .setFooter(`İşlemi gerçekleştiren: ${message.author.tag}`, message.author.displayAvatarURL());

    return embed;
}

async function deleteChannelsEmbed(message, action, roleName) {
    const embed = new Discord.MessageEmbed()
        .setColor('#ff0000')
        .setTitle(`Kanal Silme İşlemi (${action})`)
        .setDescription(`\`${roleName}\` adında bir rol ve ona ait metin ve ses kanalları silindi.`)
        .addField('Rol Silindi', roleName)
        .addField('Metin Kanalı Silindi', roleName)
        .addField('Ses Kanalı Silindi', roleName)
        .setTimestamp()
        .setFooter(`İşlemi gerçekleştiren: ${message.author.tag}`, message.author.displayAvatarURL());

    return embed;
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
    name: 'kanaltemizle',
    description: 'Ses, rol, moss kanalı siler.',
    async execute(message, args) {
        const data = await Data();
        const statusMessage = await message.channel.send('Kanallar ve roller siliniyor...');
        
        for (let i = 0; i < data.length; i++) {
            const roleName = replaceTurkishCharacters(data[i][0].toLowerCase()).replace(/\s/g, '-');

            const role = message.guild.roles.cache.find(role => replaceTurkishCharacters(role.name.toLowerCase()).replace(/\s/g, '-') === roleName);
            if (role) {
                await role.delete();
                console.log(`Deleted role: ${role.name}`);
            }

            const textChannel = message.guild.channels.cache.find(channel => channel.type === 'text' && replaceTurkishCharacters(channel.name.toLowerCase()).replace(/\s/g, '-') === roleName);
            if (textChannel) {
                await textChannel.delete();
                console.log(`Deleted text channel: ${textChannel.name}`);
            }

            const voiceChannel = message.guild.channels.cache.find(channel => channel.type === 'voice' && channel.name === `💎| ${roleName.toUpperCase()}`);
            if (voiceChannel) {
                await voiceChannel.delete();
                console.log(`Deleted voice channel: ${voiceChannel.name}`);
            }
        }

        const embed = new Discord.MessageEmbed()
            .setColor('#ff0000')
            .setTitle('Kanal Silme İşlemi Tamamlandı')
            .setDescription('Tüm belirtilen roller ve kanallar başarıyla silindi.')
            .setTimestamp()
            .setFooter(`İşlemi gerçekleştiren: ${message.author.tag}`, message.author.displayAvatarURL());

        await statusMessage.edit('', embed);
        console.log('All roles and channels deleted.');
    },
};

client.login(token);
