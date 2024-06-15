const { google } = require('googleapis');
const { SCOP, SERVİCES_FİLES, SAMPLE_ID } = require('../../config/config.json');

const auth = new google.auth.GoogleAuth({
    keyFile: SERVİCES_FİLES,
    scopes: SCOP,
});

async function clearSpreadsheetData() {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    const clearDataRequest = {
        spreadsheetId: SAMPLE_ID,
        requestBody: {
            requests: [{
                updateCells: {
                    range: {
                        sheetId: 0,
                        startRowIndex: 2, // İlk iki satır başlık olduğu için veri temizlenmiyor
                        endRowIndex: 30, // 29 satır, 0 tablosunda B3:M29 aralığına denk gelir
                        startColumnIndex: 1, // Sıfır tablosunda B'den başlıyoruz (1. sütun)
                        endColumnIndex: 14 // M sütunu (13. sütun)
                    },
                    fields: 'userEnteredValue'
                }
            }]
        }
    };

    try {
        const response = await sheets.spreadsheets.batchUpdate(clearDataRequest);
        console.log('Veri temizlendi:', response.status);
        return response.status === 200;
    } catch (error) {
        console.error('Veri temizleme hatası:', error);
        return false;
    }
}

module.exports = {
    name: 'temizle',
    description: 'E tabloyu temizler.',
    async execute(message, args) {
        const success = await clearSpreadsheetData();
        if (success) {
            message.channel.send('Veri temizleme işlemi başarılı.');
        } else {
            message.channel.send('Veri temizleme işleminde bir hata oluştu.');
        }
    },
};
