// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RecordingPanel } from '../../src/renderer/src/features/recording/RecordingPanel'
import { RecordingTerminalError } from '../../src/renderer/src/features/recording/mediaRecorderController'

describe('RecordingPanel', () => {
  afterEach(cleanup)

  it('commits on stop while navigation preserves the recording', async () => {
    const user = userEvent.setup()
    const controls = {
      start: vi.fn(async () => undefined),
      stop: vi.fn(async () => undefined),
      discard: vi.fn(async () => undefined),
    }
    const navigate = vi.fn()
    render(<RecordingPanel controls={controls} onNavigate={navigate} />)

    await user.click(screen.getByRole('button', { name: '녹음 시작' }))
    await user.click(screen.getByRole('button', { name: '설정으로 이동' }))

    expect(navigate).toHaveBeenCalledWith('settings')
    expect(controls.discard).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: '종료' }))
    expect(controls.stop).toHaveBeenCalledOnce()
    expect(controls.discard).not.toHaveBeenCalled()
  })

  it('discards only after explicit confirmation and preserves on cancellation', async () => {
    const user = userEvent.setup()
    const controls = {
      start: vi.fn(async () => undefined),
      stop: vi.fn(async () => undefined),
      discard: vi.fn(async () => undefined),
    }
    render(<RecordingPanel controls={controls} onNavigate={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: '녹음 시작' }))

    await user.click(screen.getByRole('button', { name: '폐기' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '취소' }))
    expect(controls.discard).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: '폐기' }))
    await user.click(screen.getByRole('button', { name: '녹음 폐기 확인' }))
    expect(controls.discard).toHaveBeenCalledOnce()
  })

  it('shows stopped pending state and retries Main stop without claiming to still record', async () => {
    const user = userEvent.setup()
    const controls = {
      start: vi.fn(async () => undefined),
      stop: vi
        .fn()
        .mockRejectedValueOnce(new RecordingTerminalError('stop_failed', 'database busy'))
        .mockResolvedValueOnce(undefined),
      discard: vi.fn(async () => undefined),
    }
    render(<RecordingPanel controls={controls} onNavigate={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: '녹음 시작' }))
    await user.click(screen.getByRole('button', { name: '종료' }))

    expect(await screen.findByText('녹음은 중지되었지만 저장 완료를 기다리고 있습니다.')).toBeInTheDocument()
    expect(screen.queryByText('녹음 중')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '종료 재시도' }))

    expect(controls.stop).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('button', { name: '녹음 시작' })).toBeInTheDocument()
  })

  it('shows discard retry after confirmed discard fails and never reports recording', async () => {
    const user = userEvent.setup()
    const controls = {
      start: vi.fn(async () => undefined),
      stop: vi.fn(async () => undefined),
      discard: vi
        .fn()
        .mockRejectedValueOnce(new RecordingTerminalError('discard_failed', 'database busy'))
        .mockResolvedValueOnce(undefined),
    }
    render(<RecordingPanel controls={controls} onNavigate={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: '녹음 시작' }))
    await user.click(screen.getByRole('button', { name: '폐기' }))
    await user.click(screen.getByRole('button', { name: '녹음 폐기 확인' }))

    expect(await screen.findByText('녹음은 중지되었지만 폐기를 완료하지 못했습니다.')).toBeInTheDocument()
    expect(screen.queryByText('녹음 중')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '폐기 재시도' }))

    expect(controls.discard).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('button', { name: '녹음 시작' })).toBeInTheDocument()
  })

  it('offers explicit discard when start rollback cannot safely remove the recording', async () => {
    const user = userEvent.setup()
    const controls = {
      start: vi.fn(async () => {
        throw new RecordingTerminalError('capture_failed', 'start rollback refused')
      }),
      stop: vi.fn(),
      discard: vi.fn(async () => undefined),
    }
    render(<RecordingPanel controls={controls} onNavigate={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: '녹음 시작' }))

    expect(await screen.findByText('녹음은 중지되었지만 저장 완료를 기다리고 있습니다.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '녹음 시작' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '폐기' }))
    await user.click(screen.getByRole('button', { name: '녹음 폐기 확인' }))
    expect(controls.discard).toHaveBeenCalledOnce()
  })
})
