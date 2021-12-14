const ServerInstance = require('./ServerInstance');
const os = require('os');

// Get server process priority
const getPriorityServerProcess = (osName) => {
    let priority = os.getPriority();

    if (osName === 'win32') {
        priority = Object.keys(os.constants.priority).find(key => os.constants.priority[key] === priority);
    }

    return `Process priority: ${priority}\n`
}

// Get PID and descriptor of server process
const getIDAndDescriptorServerProcess = (osName) => {
    return `Process ID: ${process.pid}\nProcess descriptor: ${osName === 'win32' ? require('./cModules/build/Release/cModule').getProcessDescriptor() : require('./cModulesLinux/build/Release/cModuleLinux').getProcessDescriptor()}\n`
}

const serverOne = new ServerInstance(1, { addr: '127.0.0.1', port: 1111 }, [
    {
        service: () => getPriorityServerProcess(serverOne.CURRENT_OS),
        description: 'Priority of the server process'
    },
    {
        service: () => getIDAndDescriptorServerProcess(serverOne.CURRENT_OS),
        description: 'Identifier and descriptor of the server process'
    },
]);