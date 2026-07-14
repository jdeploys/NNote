import { contextBridge } from 'electron'
import type { DesktopApi } from '../shared/contracts/desktopApi'

const desktopApi: DesktopApi = Object.freeze({})

contextBridge.exposeInMainWorld('desktopApi', desktopApi)
