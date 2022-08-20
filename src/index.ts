// cronicle-plugin-barco-pulse
// index.js

// Dependancies
import * as net from 'net';

const client = new net.Socket();

client.on('data', function(data) {
	console.log('Received: ' + data);
	let dataObj = JSON.parse(data.toString());
    if(dataObj['id'] == 4) {
        console.log('Current power State: ', dataObj['result'])
        powerState = dataObj['result']

        if(command == 'Power On') {
            let cmd = {"jsonrpc": "2.0", "method": "system.poweron"};
            client.write(JSON.stringify(cmd));
            console.log('Turning On Projector')
            client.destroy()
            console.log('{ "complete": 1 }');
            process.exit(0)
        } else if(command == 'Power Off') {
            if(powerState == 'ready') {
                console.log('Projector Already Off')
                client.destroy()
                console.log('{ "complete": 1 }');
                process.exit(0)

            }
            console.log('Shutting Down Projector')
            let cmd = {"jsonrpc": "2.0", "method": "system.poweroff"};
            client.write(JSON.stringify(cmd));
            client.destroy()
            console.log('{ "complete": 1 }');
            process.exit(0)

        }
    }
});

var powerState = null;

var data;

var ip;
var port = 9090
var command;

process.stdin.on('data', (res) => {
	data = JSON.parse(res.toString());
	console.log('Starting Plugin');

	try {
		//ip = data['params']['ip'];
		//command = data['params']['command'];

		ip = '192.168.11.36'
		command = 'Power Off'

		let commandUrl;

		switch (command) {
			case 'Power Off':
				executeCommand('Power Off');
				break;
			case 'Power On':
				executeCommand('Power On');
				break;
		}
	} catch (err) {
		console.log(err);

		console.log(`{ "complete": 1, "code": 999, "description": "Failed to execute: ${err}" }`);
		process.exit(999);
	}
});

async function executeCommand(command: string) {
    client.connect(port, ip, () => {
        console.log('Connected');
        getPower()
    })
    

}

async function getPower() {
    let command = {
        "jsonrpc": "2.0",
        "method":"property.get",
        "params": {"property": "system.state"},
        "id": 4
    }
    let commandJson = JSON.stringify(command);
    client.write(commandJson);
}