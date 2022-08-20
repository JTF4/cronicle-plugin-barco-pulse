
const EventEmitter = require('events');
const fs = require('fs');
const inquirer = require('inquirer');
const cp = require('child_process');
var path = require('path');

const ConsoleColors = require('../tools/console-colors');
const consoleColors = new ConsoleColors();

// Setup the storage system
const Storinator = require('./storage-class');
let storage = new Storinator();

// Setup AJV
const Ajv = require("ajv")
const ajv = new Ajv({strict: false, allowUnionTypes: true});


class PluginManager extends EventEmitter{
    constructor(){
        super();
        console.log(consoleColors.greenText, 'Starting Plugin Manager');
        
        inquirer
          .prompt(this.initQuestions)
          .then((answers) => {
            console.log(JSON.stringify(answers, null, 2));
            this.processCommand(answers.command);
        
          })
          .catch((error) => {
            if (error.isTtyError) {
              console.log("Your console environment is not supported!")
            } else {
              console.log(error)
            }
        })
    }

    initQuestions = [
        {
            type: "list",
            name: "command",
            message: "What would you like to do today?",
            choices: [
                "Install Plugin",
                "Remove Plugin"
            ]
        }
    ];

    processCommand(command) {
        switch(command) {
            case 'Install Plugin':
                this.pluginInstaller();
                break;
            case 'Remove Plugin':
                this.pluginUninstaller();
                break;
        }
    }

    pluginInstaller() {
        inquirer
        .prompt([
            {
                type: 'list',
                name: 'pluginSource',
                message: 'Where are you installing the plugin from?',
                choices: [
                    'NPM',
                    'Local File'
                ],
                validate(answer) {
                    if(!answer) {
                        return "Please enter a valid option."
                    }
                    return true
                },
            },
            {
                type: 'input',
                name: 'fileLocation',
                message: 'Where is the plugin file located?',
                validate(answer) {
                    if(!fs.existsSync(answer)) {
                        return "Please enter a valid file location."
                    } else if (fs.existsSync(answer)) {
                        if(fs.existsSync(answer + '/plugin.json') || fs.existsSync(answer + 'plugin.json')) {
                            return true;
                        } else return "It looks like your plugin is missing it's plugin.json file."
                    }
                    return false;
                },
            },
        ])
        .then((answers) => {
          console.log(JSON.stringify(answers, null, 2));
          this.installLocalFile(answers.fileLocation);
      
        })
        .catch((error) => {
          if (error.isTtyError) {
            console.log("Your console environment is not supported!")
          } else {
            console.log(error)
          }
        })
    }

    async installLocalFile(data) {
        // Spin up the storage engine and get the plugins config file.
        let pluginKey = 'global/plugins/0';

        let pluginConfig = await storage.getKey(pluginKey).catch(err => { console.log(consoleColors.redText, `ERR: Could not get key: ${err}`)} );

        console.log(pluginConfig);
        
        // Read all the plugin config files
        let pluginLocation = data;
        if(pluginLocation.slice(-1) == '/') {
            pluginLocation = pluginLocation.substring(0, str.length - 1);
        }
        let pluginManifestRaw = fs.readFileSync(pluginLocation + '/plugin.json');
        let pluginManifest = JSON.parse(pluginManifestRaw);

        // Get the plugin vars setup to be put into the data system
        pluginManifest.modified = Date.now();
        pluginManifest.create = Date.now();
        pluginManifest.enabled = 1;
        pluginManifest.username = 'PluginAutoImporter';
        
        console.log(pluginManifest);
        
        // Start moving the file to the plugins folder
        let pluginDirectory = './plugins';

        this.moveFolder(data, pluginDirectory)

        // Build the plugin config to import to the storage system

        // First validate the pluginManifest
        var validate = ajv.compile(this.pluginManifestSchema);
        if(!validate(pluginManifest)) {
            console.log(consoleColors.redText, "Plugin Manifest does not meet specification! ERR: " + JSON.stringify(validate.errors, null, "\t"));
        }




    }

    /**
     * It copies a folder from one location to another
     * @param source - The source folder to move.
     * @param destination - The destination folder where the files will be moved to.
     */

    moveFolder(source, destination) {
        cp.exec(`./scripts/move-folder.sh ${source} ${destination}`, (error, stdout, stderr) => {
            console.log(consoleColors.fgBlue + consoleColors.singleString + consoleColors.reset, stdout);
            console.log(consoleColors.fgRed + consoleColors.singleString + consoleColors.reset, stderr);
            if (error !== null) {
                console.log(consoleColors.fgRed + consoleColors.singleString + consoleColors.reset, `exec error: ${error}`);
            };
        });
    }

    sleep(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    }

    pluginManifestSchema = {
        "title": "Plugin Manifest",
        "type": "object",
        "required": ["id", "title", "command", "params"],
        "properties": {
          "id": {
            "type": "string",
            "description": "Plugin identifier"
          },
          "name": {
            "title": "string",
            "description": "Name of the plugin"
          },
          "command": {
            "type": "string",
            "description": "How to execute your plugin."
          },
          "params": {
            "type": "array",
            "required": ["id", "type", "title", "value"],
            "properties": {
              "id": {
                "type": "string"
              },
              "type": {
                "type": "string"
              },
              "title": {
                  "type": "string"
              },
              "value": {
                  "type": [
                    "string",
                    "number"
                  ]
              },
              "items": {
                  "type": "array"
              }
            }
          }
        }
      }
    

}

var test = new PluginManager();