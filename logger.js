const net = require('net');
const fs = require('fs');
const path = require('path');

const LOGGER_PATH_1 = 'logger#1.txt';
const LOGGER_PATH_2 = 'logger#2.txt';

const getCurrentTime = () => {
    return ` | ${new Date().toTimeString().split(' ')[0]}\n`;
}

const logger = net.createServer(client => {
    client.setEncoding('utf-8');
    client.setTimeout(5000);

    client.on('data', (data) => {
        const parseData = JSON.parse(data);
        const target = parseData.serverNumber;
        const info = parseData.data + ` | Server Number #${target}` + getCurrentTime();
        const filePath = path.resolve(__dirname, target === 1 ? LOGGER_PATH_1 : LOGGER_PATH_2);

        console.log(info);

        const stream = fs.createWriteStream(filePath, { flags: 'a' });
        stream.once('open', (fd) => {
            stream.write(info +'\r\n');
        });
    });

    client.on('error', (err) => {
       if (err.code === 'ECONNRESET') {
           console.log('Server is closed!');
       }
    });
});

logger.listen(8000, '127.0.0.3', () => {
    console.log('LOGGER HAS STARTED');

    logger.on('close', () => {
        console.log('LOGGER HAS STARTED');
    });

    logger.on('error', (error) => {
        console.error(JSON.stringify(error));
    });
})