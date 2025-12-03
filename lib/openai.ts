import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Transcription using Whisper
export async function transcribeAudio(
  audioBuffer: Buffer,
  options?: { language?: string; prompt?: string }
): Promise<string> {
  // Convert Buffer to Uint8Array which is compatible with Blob
  const uint8Array = new Uint8Array(audioBuffer)
  const blob = new Blob([uint8Array], { type: 'audio/m4a' })
  const file = new File([blob], 'audio.m4a', { type: 'audio/m4a' })
  
  const transcription = await openai.audio.transcriptions.create({
    file: file,
    model: 'whisper-1',
    language: options?.language || 'en',
    prompt: options?.prompt,
    response_format: 'verbose_json',
  })

  return transcription.text
}

// Image understanding for slides
export async function analyzeSlideImage(imageUrl: string): Promise<{
  text: string
  description: string
}> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract all text from this slide and provide a brief description of any charts, graphs, or visuals. Return as JSON with keys: text, description',
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
              detail: 'high',
            },
          },
        ],
      },
    ],
    max_tokens: 1000,
  })

  try {
    const content = response.choices[0].message.content || '{}'
    return JSON.parse(content)
  } catch {
    return {
      text: response.choices[0].message.content || '',
      description: '',
    }
  }
}

// Text-to-speech for questions
export async function generateSpeech(text: string): Promise<Buffer> {
  const mp3 = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'alloy',
    input: text,
  })

  return Buffer.from(await mp3.arrayBuffer())
}

// Generic completion helper
export async function complete(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: {
    model?: string
    temperature?: number
    max_tokens?: number
    response_format?: { type: 'json_object' }
  }
) {
  const response = await openai.chat.completions.create({
    model: options?.model || 'gpt-4-turbo-preview',
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.max_tokens,
    response_format: options?.response_format,
  })

  return response.choices[0].message.content
}

// Streaming completion helper
export async function* streamComplete(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: {
    model?: string
    temperature?: number
  }
) {
  const stream = await openai.chat.completions.create({
    model: options?.model || 'gpt-4-turbo-preview',
    messages,
    temperature: options?.temperature ?? 0.7,
    stream: true,
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) yield content
  }
}

