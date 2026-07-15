import type {
  ProviderDescriptor,
  SummaryProvider,
  TranscriptionProvider,
} from './providerPorts'
import type {
  SummaryProviderId,
  TranscriptionProviderId,
} from '../../../shared/contracts/settings'

function checkedMap<T extends { readonly id: string }>(
  providers: readonly T[],
  stage: 'transcription' | 'summary',
): ReadonlyMap<string, T> {
  const entries = new Map<string, T>()
  for (const provider of providers) {
    if (entries.has(provider.id)) throw new Error(`Duplicate ${stage} provider: ${provider.id}`)
    entries.set(provider.id, provider)
  }
  return entries
}

export class ProviderRegistry {
  private readonly transcriptionProviders: ReadonlyMap<string, TranscriptionProvider>
  private readonly summaryProviders: ReadonlyMap<string, SummaryProvider>

  constructor(
    transcriptionProviders: readonly TranscriptionProvider[],
    summaryProviders: readonly SummaryProvider[],
  ) {
    this.transcriptionProviders = checkedMap(transcriptionProviders, 'transcription')
    this.summaryProviders = checkedMap(summaryProviders, 'summary')
  }

  transcription(id: TranscriptionProviderId): TranscriptionProvider {
    const provider = this.transcriptionProviders.get(id)
    if (provider === undefined) throw new Error(`Unknown transcription provider: ${id}`)
    return provider
  }

  summary(id: SummaryProviderId): SummaryProvider {
    const provider = this.summaryProviders.get(id)
    if (provider === undefined) throw new Error(`Unknown summary provider: ${id}`)
    return provider
  }

  async descriptors(): Promise<ProviderDescriptor[]> {
    return Promise.all([
      ...this.transcriptionProviders.values(),
      ...this.summaryProviders.values(),
    ].map((provider) => provider.descriptor()))
  }
}
