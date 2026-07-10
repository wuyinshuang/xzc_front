import request from '@/utils/request'

export function sendChatMessage(message) {
  return request({
    url: '/ai/chat',
    method: 'post',
    data: {
      message
    }
  })
}

export function getChatHistory() {
  return request({
    url: '/ai/chat/history',
    method: 'get'
  })
}

export function deleteChatHistory(chatId) {
  return request({
    url: '/ai/chat/history/' + chatId,
    method: 'delete'
  })
}