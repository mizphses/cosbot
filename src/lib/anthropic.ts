import Anthropic from '@anthropic-ai/sdk'
import { MessageParam } from '@anthropic-ai/sdk/resources/messages.mjs'

export async function chatAnthropic(key: string, messages: MessageParam[], system: string = '') {
  const client = new Anthropic({
    apiKey: key,
  })

  const message = await client.messages.create({
    max_tokens: 8192,
    messages: messages,
    system: system,
    model: 'claude-3-5-sonnet-20240620',
  })

  return message
}
