import { app, BrowserWindow, Menu, dialog, ipcMain, shell } from 'electron'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { PDFParse } from 'pdf-parse'
import { clearConfig, getConfig, setConfig, type MainProcessAppConfig } from './configStore.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const mammoth = require('mammoth') as typeof import('mammoth')

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL)
const appIconPath = path.join(__dirname, '../build/icon.ico')
const essayFileMaxBytes = 10 * 1024 * 1024

type SaveFileOptions = {
  content: string
  defaultFileName: string
  filters: Electron.FileFilter[]
}

type OpenEssayFileResult = {
  canceled: boolean
  error?: string
  fileName?: string
  filePath?: string
  text?: string
}

function cleanImportedText(text: string) {
  return text
    .replace(/^\uFEFF/, '')
    .split(String.fromCharCode(0))
    .join('')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim()
}

async function extractPdfText(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer })

  try {
    const result = await parser.getText()

    return result.text
  } finally {
    await parser.destroy()
  }
}

function registerEditingContextMenu(window: BrowserWindow) {
  window.webContents.on('context-menu', (_event, params) => {
    const hasSelection = params.selectionText.trim().length > 0

    if (!params.isEditable && !hasSelection) {
      return
    }

    const editFlags = params.editFlags
    const template: Electron.MenuItemConstructorOptions[] = params.isEditable
      ? [
          { label: '撤销', role: 'undo', enabled: editFlags.canUndo },
          { label: '重做', role: 'redo', enabled: editFlags.canRedo },
          { type: 'separator' },
          { label: '剪切', role: 'cut', enabled: editFlags.canCut },
          { label: '复制', role: 'copy', enabled: editFlags.canCopy },
          { label: '粘贴', role: 'paste', enabled: editFlags.canPaste },
          { label: '删除', role: 'delete', enabled: editFlags.canDelete },
          { type: 'separator' },
          { label: '全选', role: 'selectAll', enabled: editFlags.canSelectAll },
        ]
      : [
          { label: '复制', role: 'copy', enabled: editFlags.canCopy || hasSelection },
          { type: 'separator' },
          { label: '全选', role: 'selectAll', enabled: editFlags.canSelectAll },
        ]

    Menu.buildFromTemplate(template).popup({ window })
  })
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

ipcMain.handle('wensibanxue:open-essay-file', async (): Promise<OpenEssayFileResult> => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: '作文文件', extensions: ['txt', 'md', 'docx', 'pdf'] },
      { name: '文本文件', extensions: ['txt', 'md'] },
      { name: 'Word 文档', extensions: ['docx'] },
      { name: 'PDF 文件', extensions: ['pdf'] },
    ],
  })

  if (canceled || filePaths.length === 0) {
    return { canceled: true }
  }

  const filePath = filePaths[0]
  const fileName = path.basename(filePath)

  try {
    const fileStat = await stat(filePath)

    if (fileStat.size > essayFileMaxBytes) {
      return { canceled: false, error: '文件超过 10MB，请选择较小的作文文件。', fileName, filePath }
    }

    const extension = path.extname(filePath).toLowerCase()
    let text = ''

    if (extension === '.txt' || extension === '.md') {
      text = await readFile(filePath, 'utf8')
    } else if (extension === '.docx') {
      const result = await mammoth.extractRawText({ buffer: await readFile(filePath) })
      text = result.value
    } else if (extension === '.pdf') {
      text = await extractPdfText(await readFile(filePath))
    } else {
      return { canceled: false, error: '暂不支持该文件格式，请选择 TXT、Markdown、DOCX 或 PDF 文件。', fileName, filePath }
    }

    const cleanedText = cleanImportedText(text)

    if (!cleanedText) {
      return {
        canceled: false,
        error: extension === '.pdf' ? '未能从该 PDF 中读取到文字，请改用可复制文字的 PDF、TXT 或 DOCX 文件。' : '文件内容为空，请选择包含作文内容的文件。',
        fileName,
        filePath,
      }
    }

    return { canceled: false, fileName, filePath, text: cleanedText }
  } catch {
    return { canceled: false, error: '文件读取失败，请确认文件未损坏且未被其他程序占用。', fileName, filePath }
  }
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
  registerEditingContextMenu(mainWindow)

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
