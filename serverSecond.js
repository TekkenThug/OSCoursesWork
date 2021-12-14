const ServerInstance = require('./ServerInstance');
const os = require('os');

// Get OS Version
const getOSVersion = () => `OS Version: ${os.version()}\n`;

// Get Keyboard code
const getKeyboardKey = (osName) => {
    return `Keyboard code: ${osName === 'win32' ? require('./cModules/build/Release/cModule').getKeyboardCode() : require('./cModulesLinux/build/Release/cModuleLinux').getKeyboardCode()}\n`
}

const serverSecond = new ServerInstance(2, { addr: '127.0.0.2', port: 3000 }, [
    {
        service: () => getKeyboardKey(serverSecond.CURRENT_OS),
        description: 'Keyboard code'
    },
    {
        service: getOSVersion,
        description: 'Server OS Version'
    }
]);