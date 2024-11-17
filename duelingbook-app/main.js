const { app, BrowserWindow, session, Menu } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
const configFilePath = path.join(__dirname, 'settings.json'); // Updated path to settings.json file
let currentTheme = 'default'; // Default theme value

app.whenReady().then(() => {
    // Read the configuration file to get the saved theme
    function loadConfig() {
        if (fs.existsSync(configFilePath)) {
            const config = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
            currentTheme = config.theme || 'default'; // Default to 'default' if theme is not set
            const windowSize = config.windowSize || { width: 1358, height: 871 }; // Default size
            return windowSize;
        } else {
            saveConfig('default'); // Create a new config with default settings
            return { width: 1358, height: 871 }; // Default size
        }
    }
    
    // Save configuration (theme and window size)
    function saveConfig(theme, windowSize) {
        const config = { 
            theme, 
            windowSize 
        };
        fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
    }

    const { width, height } = loadConfig(); // Load saved window size

    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        minWidth: 700,
        minHeight: 437,
        icon: path.join(__dirname, 'assets', 'icon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
        }
    });

     // Handle window close
     mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Save the window size when resized
    mainWindow.on('resize', () => {
        const { width, height } = mainWindow.getBounds();
        saveConfig(currentTheme, { width, height });
    });
    // Load the website
    mainWindow.loadURL('https://duelingbook.com');

    // Remove default menu
    mainWindow.setMenuBarVisibility(false);

    // Inject volume control and apply the saved theme after load
    mainWindow.webContents.on('did-finish-load', () => {
        injectVolumeControl();
        hideAds();  // Hide ads when the page is loaded
        applyTheme(currentTheme); // Apply the saved theme (default or custom)
    });

    // Handle window close
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Setup custom context menu
    setupContextMenu();
});

// Function to inject volume control
function injectVolumeControl() {
    mainWindow.webContents.executeJavaScript(`
        const audioContext = new AudioContext();
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 1; // Default volume

        document.querySelectorAll('audio, video').forEach(media => {
            const source = audioContext.createMediaElementSource(media);
            source.connect(gainNode).connect(audioContext.destination);
        });

        // Function to set volume
        window.setVolume = (value) => {
            gainNode.gain.value = value;
        };
    `);
}

// Function to hide ads by ID
function hideAds() {
    mainWindow.webContents.executeJavaScript(`
        // List of ad IDs to hide
        const adIds = ['mes1', 'mes2', 'mes3', 'mes4', 'ezmob-wrapper'];

        // Hide ads with these specific IDs
        adIds.forEach(id => {
            const adElement = document.getElementById(id);
            if (adElement) {
                adElement.style.display = 'none';  // Hide the ad element
            }
        });

        // Additionally hide any element with an ID that contains 'ezmob'
        const elements = document.querySelectorAll('[id*="ezmob"]');
        elements.forEach(element => {
            element.style.display = 'none'; // Hide any element with 'ezmob' in its ID
        });

        // Use MutationObserver to watch for new ad elements by ID
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        if (adIds.includes(node.id) || node.id.includes('ezmob')) {
                            node.style.display = 'none'; // Hide new ad elements
                        }
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    `);
}
let isRestarting = false;
// Function to setup the right-click menu
function setupContextMenu() {
    const themesDir = path.join(__dirname, 'themes');
    const availableThemes = fs.existsSync(themesDir)
        ? fs.readdirSync(themesDir).filter(theme => {
            return fs.existsSync(path.join(themesDir, theme, 'style.css'));
        })
        : [];

    const themeMenuTemplate = [
        // Default option to remove custom CSS
        {
            label: 'Default',
            click: () => {
                applyTheme('default'); // Set to default theme
                 // Prevent restarting if we're already in the process of restarting
            if (isRestarting) return;

            // Save the selected theme to the config before restarting
            saveConfig('default');

            // Set the restarting flag
            isRestarting = true;

            // Close the current window and quit the app
            app.quit();

            // Relaunch the app after it quits
            app.on('quit', () => {
                app.relaunch();  // Relaunch the app
            });
            }
        },
        ...availableThemes.map(theme => ({
            label: theme,
            click: () => {
                const themePath = path.join(themesDir, theme, 'style.css');
                applyTheme(themePath); // Apply custom theme
                 // Prevent restarting if we're already in the process of restarting
                if (isRestarting) return;

                // Save the selected theme to the config before restarting
                saveConfig(theme);

                // Set the restarting flag
                isRestarting = true;

                // Close the current window and quit the app
                app.quit();

                // Relaunch the app after it quits
                app.on('quit', () => {
                    app.relaunch();  // Relaunch the app
                });
            },
        }))
    ];

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Themes', submenu: themeMenuTemplate },
        { label: 'Settings', click: openSettings },
    ]);

    mainWindow.webContents.on('context-menu', () => {
        contextMenu.popup();
    });
}

// Function to inject custom CSS directly via JavaScript
function applyTheme(themeName = 'default') {
    const themesDir = path.join(__dirname, 'themes');
    
    if (themeName === 'default') {
        // Remove any custom styles (if present)
        mainWindow.webContents.executeJavaScript(`
            const style = document.querySelector('style');
            if (style) {
                style.remove(); // Remove custom styles
            }
        `);
    } else {
        const themePath = path.join(themesDir, themeName, 'style.css');
        if (fs.existsSync(themePath)) {
            const customCSS = fs.readFileSync(themePath, 'utf-8');

            // Remove previous styles and inject the new one
            mainWindow.webContents.executeJavaScript(`
                const existingStyle = document.querySelector('style');
                if (existingStyle) {
                    existingStyle.remove(); // Remove the old custom styles
                }
                const style = document.createElement('style');
                style.textContent = \`${customCSS}\`;
                document.head.appendChild(style);
            `);
        }
    }

   
}

// Function to load configuration from settings.json file
function loadConfig() {
    if (fs.existsSync(configFilePath)) {
        const config = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
        currentTheme = config.theme || 'default'; // Default to 'default' if theme is not set
    } else {
        saveConfig('default'); // Create a new config with default settings
    }
}

// Function to save configuration to settings.json file
function saveConfig(theme) {
    const config = { theme };
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
}

// Function to open settings
function openSettings() {
    const settingsWindow = new BrowserWindow({
        width: 400,
        height: 300,
        resizable: false,
        modal: true,
        parent: mainWindow,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    const settingsHTML = `
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Settings</h2>
                <label for="volume">Volume:</label>
                <input id="volume" type="range" min="0.5" max="3" step="0.1" value="1">
                <script>
                    const volumeSlider = document.getElementById('volume');
                    volumeSlider.addEventListener('input', () => {
                        const volume = parseFloat(volumeSlider.value);
                        window.setVolume(volume);
                    });
                </script>
            </body>
        </html>
    `;

    settingsWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(settingsHTML)}`);
}

// App lifecycle events
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
