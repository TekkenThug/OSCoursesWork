const net = require('net');
const dedent = require('dedent-js');
const os = require('os');

module.exports = class ServerInstance {
    CURRENT_OS = os.platform();
    SERVER_ADDR = '127.0.0.1';
    SERVER_PORT = 1111;
    LOGGER_CFG = {
        address: '127.0.0.3',
        port: 8000,
    };

    server;
    serverNumber;
    logger;
    services = [];

    clientList = [];

    constructor(serverNumber, options = {}, customFunctions = []) {
        // Set server number
        this.serverNumber = serverNumber;

        // Set config for socket
        if (options) {
            this.SERVER_ADDR = options.addr;
            this.SERVER_PORT = options.port;
        }

        // Bind custom functions
        if (customFunctions) {
            customFunctions.forEach(service => {
                this.services.push(service)
            })
        }

        // Set connection with logger
        this.logger = net.createConnection(this.LOGGER_CFG.port, this.LOGGER_CFG.address);
        this.logger.once('error', () => {
            console.log('Logger is shutdown');
            this.logger.destroy();
            this.logger = null;
        })

        this.server = net.createServer(client => {
                // Set encoding and timeout for every client
                client.setEncoding('utf-8');
                client.setTimeout(5000);

                // Add client to client list
                this.clientList.push(client);

                this.writeToLog(`Client #${this.clientList.length} is connected!`);

                // Send first choosing menu
                client.write(JSON.stringify({
                    data: this.getChoosingMenu(),
                    navigation: 'mainMenu'
                }));

                // Create event listener for client input data
                client.on('data',  (data) => {
                    const clientData = this.prepareDataFromClient(data);

                    // Parse navigation & user choice
                    const navigation = clientData.navigation;
                    const choice = parseInt(clientData.choice);

                    if (navigation === 'mainMenu') {
                        if (!choice && choice !== 1 && choice !== 2) {
                            client.write('Fallback data');
                            this.writeToLog('Fallback data');
                        } else {
                            const result = choice === 1 ? this.services[0].service() : this.services[1].service();
                            client.write(JSON.stringify({ data: result + this.getCurrentTime() + '\n' + this.getPostMenu(), navigation: 'postMenu' }));
                            this.writeToLog('Server send response');
                        }
                    } else if ('postMenu') {
                        if (!choice && choice !== 1 && choice !== 2) {
                            client.write('Fallback data');
                            this.writeToLog('Fallback data');
                        } else {
                            const result = choice === 1 ? this.getChoosingMenu() : 'Your has been disconnected';
                            const redirect = choice === 1 ? 'mainMenu' : 'disconnect';
                            client[choice === 1 ? 'write': 'end'](JSON.stringify({ data: result, navigation: redirect }));
                            this.writeToLog('Server send response');
                        }
                    }
                });

                client.on('end', () => {
                    this.writeToLog(`Client #${this.clientList.indexOf(client) + 1} disconnected`);
                });

                client.on('error', (error) => {
                    if (error.code === 'ECONNRESET') {
                        this.writeToLog(`Client #${this.clientList.indexOf(client) + 1} disconnected`);
                    } else {
                        this.writeToLog('Error occurred');
                    }
                })
            })

        // Check if server already exist
        this.server.once('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.log('Server is exist!');
            }
        })

        // Start listening
        this.server.listen(this.SERVER_PORT, this.SERVER_ADDR, () => {
            console.log('SERVER HAS STARTED');

            this.server.on('close', () => {
                console.log('SERVER IS CLOSED');
            });

            this.server.on('error', (error) => {
                console.error(JSON.stringify(error));
            });
        })
    }

    // Get post-response menu
    getPostMenu() {
        return dedent(`Enter 1 - get another information
                                Enter 2 - disconnect from server\n`);
    }

    // Get choosing menu
    getChoosingMenu() {
        return dedent(`Please, choose item:
                        - ${this.services[0].description} (1)
                        - ${this.services[1].description} (2)`);
    }

    // Parsing data to text & navigation mark
    prepareDataFromClient(data) {
        return JSON.parse(data);
    }

    // Get current time
    getCurrentTime() {
        return `| ${new Date().toTimeString().split(' ')[0]}\n`;
    }

    // Write into log
    writeToLog(message) {
        if (this.logger) {
            this.logger.write(JSON.stringify({ data: message, serverNumber: this.serverNumber }))
        }
    }
}

// xset -q | grep LED | awk '{ print $10 }' get linux keyboard code
