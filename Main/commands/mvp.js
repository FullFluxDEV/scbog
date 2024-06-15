const fs = require('fs').promises;
const { google } = require('googleapis');
const { yantablo, yantablo2, live, live2, result, result2, mvp, mvp2, slot, slot2, win } = require('../../config/tabloisim.json')
const { createCanvas, loadImage, registerFont } = require('canvas');
const { mvp_tablo, SCOP, SERVİCES_FİLES, SAMPLE_ID } = require('../../config/config.json')
const Discord = require('discord.js');
const {mvpX , mvpY, MVPlogonunIsimdenUzakliğiX, MVPlogonunIsimdenUzakliğiY, MVPlogoBuyuklugu} = require('../../config/kordinat.json') 

const auth = new google.auth.GoogleAuth({
    keyFile: SERVİCES_FİLES,
    scopes: SCOP,
});

async function getSpreadsheetData() {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    const [tumVeriResponse] = await Promise.all([
        sheets.spreadsheets.values.batchGet({
            spreadsheetId: SAMPLE_ID,
            ranges: mvp_tablo,
        }),
    ]);

    const combinedData = [];
    tumVeriResponse.data.valueRanges.forEach((range) => {
        const values = range.values || [];
        values.forEach((entry) => {
            combinedData.push(entry);
        });
    });

    return combinedData;
}

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

module.exports = {
    name: 'mvp',
    description: 'Mvp tablosu oluşturur.',
    async execute(message, args) {
        const data = await getSpreadsheetData();
        data.sort((a, b) => b[1] - a[1]);

        const top3Data = data.slice(0, 3);

        const canvas = createCanvas(1920, 1080);
        const context = canvas.getContext('2d');


        const backgroundImagePath = args[0] === '2' ? `../Tablolar/${mvp2}` : `../Tablolar/${mvp}`;

        const backgroundImage = await loadImage(backgroundImagePath);

        context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        registerFont('../font/x.ttf', ({ family: 'American Captain' }));
        context.fillStyle = 'black';
        context.font = '40px American Captain';

        let yOffset = 100;

        for (let i = 0; i < top3Data.length; i++) {
            let playerName = top3Data[i][0];
            let teamMahlasi = top3Data[i][2];
            let totalKills = top3Data[i][1];

            playerName = replaceTurkishCharacters(playerName);
            teamMahlasi = replaceTurkishCharacters(teamMahlasi);

            const files = await fs.readdir('./Logolar');

            if (files.includes(`${playerName}.png`)) {
                const logo = await loadImage(`./Logolar/${playerName}.png`);
                context.drawImage(logo, mvpX[i] - MVPlogonunIsimdenUzakliğiX, mvpY[i] - MVPlogonunIsimdenUzakliğiY, MVPlogoBuyuklugu[0], MVPlogoBuyuklugu[1]);
            } else if (files.includes(`${teamMahlasi}.png`)) {
                const logo = await loadImage(`./Logolar/${teamMahlasi}.png`);
                context.drawImage(logo, mvpX[i] - 100, mvpY[i] - 370, 310, 310);
            } else {
                try {
                    const logo = await loadImage(`./Logolar/default.png`);
                    context.drawImage(logo, mvpX[i] - 100, mvpY[i] - 370, 310, 310);
                } catch (error) {
                    console.error('Default logo yüklenemedi:', error);
                }
            }

            context.font = '40px American Captain';
            context.fillText(`${playerName}`, mvpX[i], mvpY[i]);
            context.font = '50px American Captain';
            context.fillText(`${totalKills}`, mvpX[i], mvpY[i] + 90);
            context.fillText(`Kill`, mvpX[i] + 40, mvpY[i] + 10 + 90);
            yOffset += 140;
        }

        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'slot.png');
        message.channel.send({ files: [attachment] });
    },
};
