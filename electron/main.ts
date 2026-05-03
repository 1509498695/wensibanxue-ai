import { app, BrowserWindow, Menu, dialog, ipcMain, shell } from 'electron'
import { fileURLToPath } from 'node:url'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { clearConfig, getConfig, setConfig, type MainProcessAppConfig } from './configStore.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL)
const appIconPath = path.join(__dirname, '../build/icon.ico')

type SaveFileOptions = {
  content: string
  defaultFileName: string
  filters: Electron.FileFilter[]
}

ipcMain.handle('wensibanxue:save-file', async (_event, options: SaveFileOptions) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: options.defaultFileName,
    filters: options.filters,
  })

  if (canceled || !filePath) {
    return { canceled: true }
  }

  await writeFile(filePath, options.content, 'utf8')

  return { canceled: false, filePath }
})

ipcMain.handle('wensibanxue:get-config', () => getConfig())

ipcMain.handle('wensibanxue:set-config', (_event, config: MainProcessAppConfig) => {
  setConfig(config)
  return { ok: true }
})

ipcMain.handle('wensibanxue:clear-config', () => {
  clearConfig()
  return { ok: true }
})

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1180,
    minHeight: 760,
    backgroundColor: '#f7f9ff',
    icon: appIconPath,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  Menu.setApplicationMenu(null)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev) {
    void mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL!)
    return
  }

  void mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
}

app.whenReady().then(() => {
  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
