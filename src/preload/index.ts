import { contextBridge, ipcRenderer } from 'electron'
import type { DesktopApi } from '../shared/contracts/desktopApi'
import type { RecordingChunk } from '../shared/contracts/recording'
import type { CreateTemplateInput, UpdateTemplateInput } from '../shared/contracts/template'

const settings: DesktopApi['settings'] = Object.freeze({
  saveApiKey: (value: string) => ipcRenderer.invoke('settings:save-api-key', value),
  getApiKeyStatus: () => ipcRenderer.invoke('settings:get-api-key-status'),
  deleteApiKey: () => ipcRenderer.invoke('settings:delete-api-key'),
})

const recording: DesktopApi['recording'] = Object.freeze({
  start: (meetingId: string) => ipcRenderer.invoke('recording:start', meetingId),
  appendChunk: (chunk: RecordingChunk) => ipcRenderer.invoke('recording:append-chunk', chunk),
  pause: (meetingId: string) => ipcRenderer.invoke('recording:pause', meetingId),
  resume: (meetingId: string) => ipcRenderer.invoke('recording:resume', meetingId),
  stop: (meetingId: string) => ipcRenderer.invoke('recording:stop', meetingId),
  discard: (meetingId: string) => ipcRenderer.invoke('recording:discard', meetingId),
})

const recovery: DesktopApi['recovery'] = Object.freeze({
  scan: () => ipcRenderer.invoke('recovery:scan'),
  recover: (meetingId: string) => ipcRenderer.invoke('recovery:recover', meetingId),
  keepAsFile: (meetingId: string) => ipcRenderer.invoke('recovery:keep-as-file', meetingId),
  discard: (meetingId: string, options: { explicitDelete: true }) =>
    ipcRenderer.invoke('recovery:discard', meetingId, options),
})

const templates: DesktopApi['templates'] = Object.freeze({
  list: () => ipcRenderer.invoke('templates:list'),
  create: (input: CreateTemplateInput) => ipcRenderer.invoke('templates:create', input),
  update: (id: string, input: UpdateTemplateInput) => ipcRenderer.invoke('templates:update', id, input),
  reorderSections: (id: string, orderedSectionIds: string[]) => ipcRenderer.invoke('templates:reorder-sections', id, orderedSectionIds),
  delete: (id: string) => ipcRenderer.invoke('templates:delete', id),
})

const desktopApi: DesktopApi = Object.freeze({ settings, recording, recovery, templates })

contextBridge.exposeInMainWorld('desktopApi', desktopApi)
