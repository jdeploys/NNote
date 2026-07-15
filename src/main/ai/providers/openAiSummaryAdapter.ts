import type { OpenAiSummaryGatewayPort } from '../openAiGateway'
import { toSummaryOpenAiError } from '../openAiErrors'
import { toProviderError } from './providerErrors'
import type {
  ProviderAvailability,
  ProviderDescriptor,
  SummaryProvider,
  SummaryRequest,
} from './providerPorts'

const available: ProviderAvailability = { available: true, code: null, message: null }

export class OpenAiSummaryAdapter implements SummaryProvider {
  readonly id = 'openai' as const

  constructor(private readonly gateway: OpenAiSummaryGatewayPort) {}

  async availability(): Promise<ProviderAvailability> {
    return available
  }

  async descriptor(): Promise<ProviderDescriptor> {
    return {
      id: this.id,
      stage: 'summary',
      displayName: 'OpenAI',
      availability: await this.availability(),
      privacy: 'text_cloud',
      capabilities: ['api_key'],
    }
  }

  async summarize(request: SummaryRequest): Promise<string> {
    try {
      return await this.gateway.summarize(request)
    } catch (error) {
      throw toProviderError(toSummaryOpenAiError(error))
    }
  }
}
