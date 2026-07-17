import type { ProcessingProviderDescriptor } from '../../../../shared/contracts/settings'

const guidance: Readonly<Record<string, string>> = {
  CODEX_NOT_INSTALLED: 'Codex CLI가 설치되어 있지 않습니다. 터미널에서 Codex CLI를 설치한 뒤 다시 확인하세요.',
  CODEX_NOT_AUTHENTICATED: 'Codex CLI에 로그인되어 있지 않습니다. 터미널에서 로그인한 뒤 다시 확인하세요.',
  CODEX_CONFIG_INVALID: 'Codex CLI 설정이 올바르지 않습니다. 터미널에서 설정을 확인한 뒤 다시 시도하세요.',
  CODEX_UNAVAILABLE: 'Codex CLI를 사용할 수 없습니다. 터미널에서 실행 상태를 확인한 뒤 다시 시도하세요.',
}

const troubleshooting: Readonly<Record<string, readonly string[]>> = {
  CODEX_NOT_INSTALLED: ['npm install --global @openai/codex', 'codex --version'],
  CODEX_NOT_AUTHENTICATED: ['codex login', 'codex login status'],
  CODEX_CONFIG_INVALID: ['codex login status', '오류에 표시된 설정 파일과 줄을 수정하세요.', 'codex login status'],
  CODEX_UNAVAILABLE: ['codex --version', 'codex login status'],
}

interface CodexCliStatusProps {
  descriptor: ProcessingProviderDescriptor
  onAvailabilityChanged: () => Promise<void>
}

export function CodexCliStatus({ descriptor, onAvailabilityChanged }: CodexCliStatusProps) {
  const status = descriptor.availability.available
    ? 'Codex CLI가 설치되고 인증되어 사용할 수 있습니다.'
    : guidance[descriptor.availability.code ?? ''] ?? guidance.CODEX_UNAVAILABLE
  const steps = descriptor.availability.available
    ? null
    : troubleshooting[descriptor.availability.code ?? ''] ?? troubleshooting.CODEX_UNAVAILABLE

  return <section className="cli-status" aria-label="Codex CLI 상태">
    {descriptor.privacy === 'text_cloud' && <div className="provider-notice provider-notice-cloud">
      <strong>전사문이 Codex 계정으로 전송됩니다.</strong>
      <p>로컬 추론이 아닌 클라우드 처리입니다.</p>
    </div>}
    <div className="provider-status-row">
      <span className={`status-dot ${descriptor.availability.available ? 'is-ready' : 'is-warning'}`} aria-hidden="true" />
      <p>{status}</p>
    </div>
    {steps !== null && <section className="codex-troubleshooting" aria-label="Codex CLI 문제 해결">
      <strong>문제 해결 방법</strong>
      <ol>{steps.map((step, index) => <li key={`${index}-${step}`}>
        {step.startsWith('codex ') || step.startsWith('npm ') ? <code>{step}</code> : step}
      </li>)}</ol>
      <button type="button" onClick={() => void onAvailabilityChanged()} aria-label="Codex CLI 상태 다시 확인">다시 확인</button>
    </section>}
    <p className="provider-help">Nnote는 전역 Codex 설정이나 로그인 정보를 변경하지 않습니다.</p>
  </section>
}
