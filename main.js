'use strict';

const electron = require('electron');
const fs = require('fs');

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const identityFileLocation = __dirname + '/identity';
let mainWindow;

function genUuid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

function writeUuidToFile(uuid) {
    fs.writeFile(identityFileLocation, uuid, function(err) {
        if (err) {
            console.log('Error writing to: ' + identityFileLocation)
            return console.log(err);
        }
        console.log('Generated identity at: ' + identityFileLocation);
    });
}

function readUuidFromFile() {
    try {
        return fs.readFileSync(identityFileLocation);
    } catch(err) {
        console.log('No identity file found.')
    }
    return null;
}

function getIdentity() {
    let identity = readUuidFromFile();
    if (identity === null || identity === undefined) {
        identity = genUuid()
        writeUuidToFile(identity);
    }
    return identity;
}

function createWindow () {
    global.uuidIdentity = String(getIdentity());
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 800, height: 600});

    // and load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

// When ready to start
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
