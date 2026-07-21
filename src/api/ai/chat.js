import axios from 'axios'

const aiService = axios.create({
  timeout: 60000
})

export function sendChatMessage(message) {
  return aiService.post('/xzc/api/admin/ai/chat', {
    input: message
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export function getChatHistory() {
  return axios.get('/ai/chat/history')
}

export function deleteChatHistory(chatId) {
  return axios.delete('/ai/chat/history/' + chatId)
}