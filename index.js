const { app, BrowserWindow } = require('electron');
const path = require('path');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        title: 'Task Manager',
        icon: path.join(__dirname, 'app', './Assets/logo.png'),
        show: false 
    });
    win.loadFile('app/index.html');
    win.setMenuBarVisibility(false);
    win.once('ready-to-show', () => {
        win.show();
    });
}

app.whenReady().then(() => {
    createWindow();
});
