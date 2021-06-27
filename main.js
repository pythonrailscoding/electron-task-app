const  electron = require('electron')
const url = require('url')
const path = require('path')

const {app, BrowserWindow, Menu, ipcMain} = electron;
let mainWindow;
let addWindow;


// Listen for App to be ready
app.on('ready', function (){
    mainWindow = new BrowserWindow({
        webPreferences:{
            nodeIntegration:true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "mainWindow.html"),
        protocol: 'file:',
        slashes: true
    }));

    // Quit All Windows on close
    mainWindow.on('closed', function (){
        app.quit();
    })

    // Build menu from Template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
});

// Handle create Add window
function createAddWindow() {
    addWindow = new BrowserWindow({
        width: 300,
        height: 280,
        title: 'Add Shopping List item',
        webPreferences:{
            nodeIntegration:true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, "add.html"),
        protocol: 'file:',
        slashes: true
        // Returns like file://home/yourname/yourdir/add.html -- I am on Ubuntu
    }));
    // Collect Garbage
    addWindow.on('close', function (){
        addWindow = null
    })
}

// Catch item add on add.html
ipcMain.on('item:add', function (e, item){
    // console.log(item);
    // Grab the contents from ipcRenderer in add.html
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

// Create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                accelerator: process.platform === 'darwin' ? 'Command+L' : 'Ctrl+L',
                click() {
                    createAddWindow()
                }
            },
            {
                label: 'Clear All Items',
                accelerator: process.platform === 'darwin' ? 'Command+F' : 'Ctrl+F',
                click() {
                    // Send contents to our mainWindow.html
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                // Add a keyboard shortcut to quit
                accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                // If on mac, above will return darwin but on windows, win32
                click() {
                    // Quit the Application
                    app.quit();
                }
            }
        ]
    }
];

// If mac, add empty object to menu because Menu will on mac have a logo by default in place of our Default menu label
if(process.platform === 'darwin'){
    mainMenuTemplate.unshift({});
    // Unshift adds on to the beginning of the lst
}

// Add dev tools if not in production
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        // Push adds on to the end of the list
        label: "Developer Tools",
        submenu:[
            {
                label: 'Toggle Dev Tools',
                accelerator: process.platform === 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}

