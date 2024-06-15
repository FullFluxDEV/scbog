const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const fetch = require('node-fetch');
const { token, prefix, logokanalId, botkullanım } = require('../config/config.json');

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

const cooldowns = new Map();

client.once('ready', () => {
    console.log('Aktif--');
    client.user.setPresence({
        activity: {
            name: 'Fbı Scrim Bot',
            type: 'PLAYING'
        },
        status: 'online'
    });
});

client.on('message', async (message) => {
    if (message.author.bot) return;
    if(message.content == '!yardım'){
        const commandList = client.commands.map(command =>`✅     ${prefix}${command.name}- ${command.description}`).join('\n');
        const helpMessage = `        Yardım Menüsü**\n\n${commandList}`;
        message.channel.send(helpMessage);
    }
    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (!client.commands.has(commandName)) return;

        const command = client.commands.get(commandName);

        const now = Date.now();
        const timestamps = cooldowns.get(message.author.id) || {};
        const cooldownAmount = commandName === 'yetkili' ? 60 * 1000 : 10 * 1000;

        if (timestamps[commandName] && now < timestamps[commandName] + cooldownAmount) {
            const timeLeft = (timestamps[commandName] + cooldownAmount - now) / 1000;
            return message.reply(`Komutu kullanabilmek için ${timeLeft.toFixed(1)} saniye beklemelisiniz.`);
        }

        timestamps[commandName] = now;
        cooldowns.set(message.author.id, timestamps);

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply('Komutu çalıştırmaya çalışırken bir hata oluştu!');
        }
    }

    if (message.channel.id === logokanalId && message.attachments.size > 0) {
        await handleLogoUpload(message);
    }
});

async function handleLogoUpload(message) {
    const attachment = message.attachments.first();
    const imageURL = attachment.url;
    const savePath = '../Main/Logolar';
    const fileExtension = attachment.name.split('.').pop().toLowerCase();
    const fileName = `${savePath}/${message.content}.png`;

    if (message.content === "") {
        return await message.reply({ content: 'Hey ekip ismini yazman lazım!', ephemeral: true });
    }

    try {
        if (fs.existsSync(fileName)) {
            const filter = (reaction, user) => user.id === message.author.id && (reaction.emoji.name === '✅' || reaction.emoji.name === '❌');
            const options = { max: 1, time: 60000, errors: ['time'] };

            const sentMessage = await message.reply(`**${message.content}** isimli ekip zaten var. Değiştirmek istiyor musunuz? ✅ veya ❌ emojilerine basarak cevap veriniz.`);
            await sentMessage.react('✅');
            await sentMessage.react('❌');

            const reactions = await sentMessage.awaitReactions(filter, options);
            const reaction = reactions.first();

            if (reaction.emoji.name === '✅') {
                fs.unlinkSync(fileName);
                await saveImage(imageURL, fileName);
                message.reply(`**${message.content}** adlı ekibin logosu değiştirildi.`);
            } else {
                message.reply(`Ekip ismi "${message.content}" ile ilgili dosya değiştirilmedi.`);
            }
        } else {
            await saveImage(imageURL, fileName);
            message.reply(`Resim başarıyla kaydedildi: ${fileName}`);
        }
    } catch (error) {
        console.error('Resim kaydetme hatası:', error);
        message.reply('Resim kaydetme sırasında bir hata oluştu.');
    }
}

async function saveImage(url, path) {
    const response = await fetch(url);
    const buffer = await response.buffer();
    fs.writeFileSync(path, buffer);
}

client.login(token);
