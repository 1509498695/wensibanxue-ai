export {}

declare global {
  interface Window {
    wensibanxue: {
      platform: string
      versions: {
        chrome: string
        electron: string
        node: string
      }
    }
  }
}
