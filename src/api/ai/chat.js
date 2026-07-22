import { XZC_API, xzcService } from '../xzc'

const STREAM_URL = `${XZC_API}/api/admin/ai/chat/stream`
const SYNC_URL = `${XZC_API}/api/admin/ai/chat`

export function listChatSessions() {
  return xzcService.get(`${XZC_API}/api/admin/ai/chat/sessions`).then(res => res.data)
}

export function getChatHistory(sessionId) {
  return xzcService.get(`${XZC_API}/api/admin/ai/chat/history/${sessionId}`).then(res => res.data)
}

export function deleteChatSession(sessionId) {
  return xzcService.delete(`${XZC_API}/api/admin/ai/chat/session/${sessionId}`).then(res => res.data)
}

export function sendChatMessageSync(data) {
  return xzcService.post(SYNC_URL, data).then(res => res.data)
}

export async function sendChatMessageStream(data, callbacks) {
  const { onInit, onIntent, onTool, onMessage, onEnd, onError } = callbacks || {}
  try {
    const response = await fetch(STREAM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Requested-With': 'XMLHttpRequest'
      },
      cache: 'no-store',
      credentials: 'same-origin',
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `HTTP error! status: ${response.status}`)
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      
      const eventSeparator = '\n\n'
      let eventEndIndex = buffer.indexOf(eventSeparator)
      
      while (eventEndIndex !== -1) {
        const eventStr = buffer.substring(0, eventEndIndex)
        buffer = buffer.substring(eventEndIndex + eventSeparator.length)
        
        const lines = eventStr.split('\n')
        let eventData = ''
        
        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed.startsWith('data:')) {
            eventData += trimmed.slice(5).trim()
          }
        }
        
        if (eventData) {
          try {
            const event = JSON.parse(eventData)
            switch (event.type) {
              case 'init':
                onInit && onInit(event)
                break
              case 'intent':
                onIntent && onIntent(event)
                break
              case 'tool':
                onTool && onTool(event)
                break
              case 'text':
              case 'message':
              case 'delta':
                onMessage && onMessage(event)
                break
              case 'end':
              case 'done':
                onEnd && onEnd(event)
                return
              case 'error':
                onError && onError(event)
                return
            }
          } catch (e) {
            console.warn('Parse SSE event failed:', eventData, e)
          }
        }
        
        eventEndIndex = buffer.indexOf(eventSeparator)
      }
    }
    
    onEnd && onEnd({})
  } catch (error) {
    onError && onError({ error: error.message || '流式请求失败' })
    throw error
  }
}
