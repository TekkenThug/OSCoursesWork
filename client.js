const net = require('net');
const prompt = require('prompt');
const dedent = require('dedent-js');
const cModule = require('./cModules/build/Release/cModule');

prompt.start();

const SERVER_FIRST = {
    addr: '127.0.0.1',
    port: 1111,
}
const SERVER_SECOND = {
    addr: '127.0.0.2',
    port: 3000,
}

const choosingServer = async (withCaption = true) => {
    if (withCaption) {
        console.log(dedent(`Press key 1 for connection to first server.
                This server will send information such as
                - Priority of the server process
                - Identifier and descriptor of the server process\n
                Press key 2 for connection to second server
                This server will send information such as
                - Current keyboard layout code
                - OS version`));
    }

    let { chooseServer } = await prompt.get('chooseServer');
    chooseServer = parseInt(chooseServer);

    if (!chooseServer) {
        console.log('Invalid input, please, repeat');
        return choosingServer(false);
    }

    if (chooseServer !== 1 && chooseServer !== 2) {
        console.log('Incorrect value, please, repeat');
        return choosingServer(false);
    }

    return chooseServer;
}

const prepareDataFromServer = (data) => {
    return JSON.parse(data);
}

const prepareToConnect = async () => {
    const serverNumber = await choosingServer();
    await connectToServer(serverNumber);
}

const connectToServer = async (serverNumber) => {
    const serverToConnect = serverNumber === 1 ? SERVER_FIRST : SERVER_SECOND;

    const client = net.createConnection(serverToConnect.port, serverToConnect.addr,  () => {
        // Set encoding
        client.setEncoding('utf-8');

        // Connecting is successful
        console.log(`Connect to Server ${serverNumber} is successful\n`);

        // Set event listener for input data from server
        client.on('data', (data) => {
            const serverInfo = prepareDataFromServer(data);
            const navigation = serverInfo.navigation;
            const text = serverInfo.data;

            console.log(text);

            // If disconnected, call new connection
            if (navigation === 'disconnect') {
                client.destroy();
                setTimeout(() => prepareToConnect(), 200);
                return;
            }

            // Send client choose on server
            prompt.get('choice', (err, result) => {
                client.write(JSON.stringify({ choice: result.choice, navigation }));
            });
        });

        // Handler
        client.on('close', () => {
            console.log('Connection to server has closed');
        });

        client.on('end', () => {
            console.log('Disconnected from server');
        });
    });

    client.once('error', (error) => {
       if (error.code === 'ECONNREFUSED') {
           console.log('Sorry, server is not enable');
       }
    });
}

const startup = async () => {
    console.log('CLIENT HAS STARTED\n');
    await prepareToConnect();
}

startup();

