import fs from 'fs';
import https from 'https';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function download(url, dest) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`Request failed with status code ${ res.statusCode }`))
            }

            const file = fs.createWriteStream(dest)
            file.on('error', (err) => reject(err))
            file.on('finish', () => file.close(() => resolve()))
            res.pipe(file)
        })

        req.on('error', (err) => reject(err))
    });
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const files = [
    {
        url: 'https://mtgjson.com/api/v5/AtomicCards.json',
        dst: './data/mtg.json',
    },
];

if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}

files.forEach(file => {
    download(file.url, file.dst).then(() => {
        console.log(`${file.dst} downloaded successfully!`);
    }).catch(err => console.error(err));
})