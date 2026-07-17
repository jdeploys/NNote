import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const beforeExpected = {
  '01-dashboard.png': '4c5a6dd2db4dd112293eaaaae6cfe18692b3228f7387243fbf95a0f63fa6382d',
  '02-recording.png': 'f481e9751d2ab7898ff339013d0b7697d86e6e3084b7b1f685657642ba3f2593',
  '03-recovery.png': '1e3c38a81d9499a45b6f29b0f1b25cfdf372cbcf904bca4ede9f079352404ec6',
  '04-processing-failed.png': '5a678955bb78b0f1ee89c0c777d253b8f3f789b3989e80a2cda9244bceca03c0',
  '05-meeting-detail.png': '2b7819b106e40819f4b984834dc28eef125e482f131139ad61d2f4aef256643f',
  '06-template-editor.png': '722949a234ae92e0c81f4a05e4373a1ffc53b98754ef37c5a18184f0a5fedc5d',
  '07-api-key-settings.png': 'c30d9ce7244019a22ac327da97747b578fa356b6576d0d9de3a10bf66bc78b22',
} as const

const afterLinearExpected = {
  '01-dashboard.png': '7d60b8f5370c5ea4360c29cb66a7ada8994c96f2fd9445710429d7a6231a0cc2',
  '02-recording.png': '4b4867ea8f03bb535b17e35fb833e25a9e91141dc0a9da7e1d4bafde51baba79',
  '03-recovery.png': '583b32973ed19c00fd25294885177294d46d6ea36d962a6e28c6c017501f1313',
  '04-processing-failed.png': '14060c0f0ed8d8a59cac79482d23f802d1824c8dd1a07aee7909b449ac469ab2',
  '05-meeting-detail.png': '7fa1ac560dcbcd2324ad9fae9cfa495a1f342e79ba73649be6126cc9f83df181',
  '06-template-editor.png': '388dd4eab3d1d5422be53f1d66a01a6cf84fc42d01ed4f9024b4c11c36e1fdae',
  '07-api-key-settings.png': '65a717a7b6f05e6301d99fff5205eafa91e2ad04215da712be7c7f1106ab5ec6',
  '08-processing-provider-defaults.png': 'fc4e458c827387d3a3e44b048e4c638f4aa33e6161990a89fb049e0768d363c7',
  '09-processing-provider-advanced.png': '11007bb2c4645b0ec565b7ab67416a0aa9fdc6717d15d184508470449117fe60',
  '10-whisper-model-downloading.png': '02d3ea416f8430aa6be51c0557c010523f8a2474b68ce5d44ac1ad7ce14f0abf',
  '11-whisper-model-installed.png': '75be8ac9339dc8dfb189249428245f26e7e05f5a2782ca78d5ff4ae120a2d944',
  '12-codex-cli-available.png': 'e49d6d667d93e6347b939bec05688b41fadc5d17b2cd03b839d62900aecc5255',
  '13-codex-cli-unavailable.png': 'f73b817faea3915cb41132ec2d675befa57478cd7e948583386b3c6a992e4d07',
} as const

describe('Before redesign screenshots', () => {
  for (const [name, checksum] of Object.entries(beforeExpected)) {
    it(`preserves ${name} byte-for-byte`, () => {
      const contents = readFileSync(resolve('docs', 'screenshots', name))
      expect(createHash('sha256').update(contents).digest('hex')).toBe(checksum)
    })
  }
})

describe('Linear redesign screenshots', () => {
  for (const [name, checksum] of Object.entries(afterLinearExpected)) {
    it(`preserves after-linear/${name} byte-for-byte`, () => {
      const contents = readFileSync(resolve('docs', 'screenshots', 'after-linear', name))
      expect(createHash('sha256').update(contents).digest('hex')).toBe(checksum)
    })
  }
})
