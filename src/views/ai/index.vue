<template>
  <div class="ai-chat-container">
    <div class="chat-sidebar">
      <div class="new-chat-btn">
        <el-button type="primary" plain @click="newChat">
          <svg-icon icon-class="plus" />
          新对话
        </el-button>
      </div>
      <div class="chat-history">
        <div
          v-for="(chat, index) in chatHistory"
          :key="index"
          :class="['chat-item', { active: currentChatIndex === index }]"
          @click="switchChat(index)"
        >
          <div class="chat-preview">{{ chat.preview }}</div>
          <el-button
            v-if="chatHistory.length > 1"
            type="text"
            class="delete-btn"
            @click.stop="deleteChat(index)"
          >
            <svg-icon icon-class="close" />
          </el-button>
        </div>
      </div>
    </div>

    <div class="chat-main">
      <div class="chat-header">
        <span class="chat-title">AI对话</span>
        <el-button type="text" @click="clearCurrentChat">
          <svg-icon icon-class="delete" />
          清空
        </el-button>
      </div>

      <div ref="chatContent" class="chat-content">
        <div v-if="messages.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg-icon icon-class="chat-dot-round" />
          </div>
          <p class="empty-text">开始与AI对话</p>
          <div class="suggestions">
            <el-tag
              v-for="(suggestion, index) in suggestions"
              :key="index"
              @click="sendMessage(suggestion)"
            >
              {{ suggestion }}
            </el-tag>
          </div>
        </div>

        <div v-for="(message, index) in messages" :key="index" :class="['message-item', message.role]">
          <div class="avatar">
            <svg-icon v-if="message.role === 'user'" icon-class="user" />
            <svg-icon v-else icon-class="bot" />
          </div>
          <div class="message-content">
            <div class="message-text" v-html="formatMessage(message.content)"></div>
          </div>
        </div>

        <div v-if="isLoading" class="loading-item">
          <div class="avatar">
            <svg-icon icon-class="bot" />
          </div>
          <div class="message-content">
            <div class="loading-text">
              <span class="loading-dot"></span>
              <span class="loading-dot"></span>
              <span class="loading-dot"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input-area">
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="2"
          placeholder="输入消息，Enter 发送，Shift+Enter 换行"
          @keydown.enter.exact.prevent="handleSend"
          :disabled="isLoading"
        />
        <el-button
          type="primary"
          :disabled="!inputMessage.trim() || isLoading"
          @click="handleSend"
        >
          <svg-icon icon-class="send" />
        </el-button>
      </div>

      <div class="chat-footer">
        <span>AI 生成内容仅供参考，请注意甄别</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { sendChatMessage } from '@/api/ai/chat'

const chatContent = ref(null)
const inputMessage = ref('')
const isLoading = ref(false)
const currentChatIndex = ref(0)
const chatHistory = ref([
  {
    preview: '开始新对话',
    messages: []
  }
])

const suggestions = [
  '你能干什么？',
  '查客户定价需要哪些信息？',
  '利率上限是多少？',
  '帮我输出定价报告'
]

const messages = ref([])

function formatMessage(content) {
  let formatted = content
    .replace(/\n/g, '<br/>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
  return formatted
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContent.value) {
      chatContent.value.scrollTop = chatContent.value.scrollHeight
    }
  })
}

async function handleSend() {
  const message = inputMessage.value.trim()
  if (!message || isLoading.value) return

  await sendMessage(message)
}

async function sendMessage(message) {
  if (isLoading.value) return

  inputMessage.value = ''
  messages.value.push({ role: 'user', content: message })
  isLoading.value = true
  scrollToBottom()

  try {
    const response = await sendChatMessage(message)
    messages.value.push({ role: 'assistant', content: response.data || response.message || '暂无回复' })

    const currentChat = chatHistory.value[currentChatIndex.value]
    currentChat.messages = [...messages.value]
    currentChat.preview = message.length > 20 ? message.substring(0, 20) + '...' : message
  } catch (error) {
    ElMessage.error('发送失败，请重试')
    messages.value.push({ role: 'assistant', content: '抱歉，我现在无法回答，请稍后重试。' })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

function newChat() {
  chatHistory.value.unshift({
    preview: '新对话',
    messages: []
  })
  currentChatIndex.value = 0
  messages.value = []
}

function switchChat(index) {
  currentChatIndex.value = index
  const chat = chatHistory.value[index]
  messages.value = [...chat.messages]
  scrollToBottom()
}

function deleteChat(index) {
  if (chatHistory.value.length === 1) {
    chatHistory.value[0] = {
      preview: '开始新对话',
      messages: []
    }
    messages.value = []
    return
  }

  chatHistory.value.splice(index, 1)
  if (currentChatIndex.value >= chatHistory.value.length) {
    currentChatIndex.value = chatHistory.value.length - 1
  }
  messages.value = [...chatHistory.value[currentChatIndex.value].messages]
  scrollToBottom()
}

function clearCurrentChat() {
  messages.value = []
  const currentChat = chatHistory.value[currentChatIndex.value]
  currentChat.messages = []
  currentChat.preview = '开始新对话'
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style lang="scss" scoped>
.ai-chat-container {
  display: flex;
  height: calc(100vh - 130px);
  background: #f5f7fa;
  border-radius: 8px;
  overflow: hidden;
}

.chat-sidebar {
  width: 280px;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.new-chat-btn {
  padding: 12px;
  border-bottom: 1px solid #e4e7ed;

  .el-button {
    width: 100%;
    justify-content: flex-start;
    padding-left: 12px;
  }
}

.chat-history {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f7fa;
  }

  &.active {
    background-color: #ecf5ff;
    border-left: 3px solid #409eff;
  }
}

.chat-preview {
  flex: 1;
  font-size: 13px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-btn {
  color: #909399;
  padding: 0;
  width: 24px;
  height: 24px;

  &:hover {
    color: #f56c6c;
  }
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.chat-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .chat-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #fafafa;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.empty-icon {
  font-size: 64px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #606266;
  margin-bottom: 24px;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;

  .el-tag {
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: #ecf5ff;
      color: #409eff;
      border-color: #b3d8ff;
    }
  }
}

.message-item {
  display: flex;
  margin-bottom: 20px;

  &.user {
    flex-direction: row-reverse;

    .message-content {
      background: #409eff;
      color: #fff;
      border-radius: 12px 12px 0 12px;
    }
  }

  &.assistant {
    .message-content {
      background: #fff;
      color: #303133;
      border-radius: 12px 12px 12px 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
  }
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .svg-icon {
    width: 20px;
    height: 20px;
    color: #909399;
  }

  & + .message-content {
    margin-left: 12px;
  }

  &:has(+ .message-content) {
    margin-right: 12px;
  }
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.6;
}

.message-text {
  white-space: pre-wrap;
  word-break: break-all;

  pre {
    background: #f5f7fa;
    border-radius: 6px;
    padding: 12px;
    overflow-x: auto;
    margin: 8px 0;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;
  }

  code {
    background: #f5f7fa;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
  }
}

.loading-item {
  display: flex;

  .loading-text {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 12px 16px;
    background: #fff;
    border-radius: 12px 12px 12px 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .loading-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #409eff;
    animation: loading 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes loading {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.chat-input-area {
  padding: 16px 20px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  gap: 12px;
  background: #fff;

  .el-input {
    flex: 1;

    textarea {
      resize: none;
    }
  }

  .el-button {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    .svg-icon {
      width: 20px;
      height: 20px;
    }
  }
}

.chat-footer {
  padding: 8px 20px;
  text-align: center;
  font-size: 12px;
  color: #c0c4cc;
  border-top: 1px solid #f0f2f5;
}
</style>