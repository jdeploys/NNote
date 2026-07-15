import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const expected = {
  '01-dashboard.png': '4c5a6dd2db4dd112293eaaaae6cfe18692b3228f7387243fbf95a0f63fa6382d',
  '02-recording.png': 'f481e9751d2ab7898ff339013d0b7697d86e6e3084b7b1f685657642ba3f2593',
  '03-recovery.png': '1e3c38a81d9499a45b6f29b0f1b25cfdf372cbcf904bca4ede9f079352404ec6',
  '04-processing-failed.png': '5a678955bb78b0f1ee89c0c777d253b8f3f789b3989e80a2cda9244bceca03c0',
  '05-meeting-detail.png': '2b7819b106e40819f4b984834dc28eef125e482f131139ad61d2f4aef256643f',
  '06-template-editor.png': '722949a234ae92e0c81f4a05e4373a1ffc53b98754ef37c5a18184f0a5fedc5d',
  '07-api-key-settings.png': 'c30d9ce7244019a22ac327da97747b578fa356b6576d0d9de3a10bf66bc78b22',
} as const

describe('Before redesign screenshots', () => {
  for (const [name, checksum] of Object.entries(expected)) {
    it(`preserves ${name} byte-for-byte`, () => {
      const contents = readFileSync(resolve('docs', 'screenshots', name))
      expect(createHash('sha256').update(contents).digest('hex')).toBe(checksum)
    })
  }
})
