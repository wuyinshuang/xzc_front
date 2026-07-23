<template>
  <div class="ai-chat-container">
    <div class="chat-sidebar">
      <div class="new-chat-btn">
        <el-button type="primary" plain @click="handleNewChat">
          <el-icon><Plus /></el-icon>
          新对话
        </el-button>
      </div>
      <div class="chat-history" v-loading="sessionLoading">
        <div
          v-for="session in chatSessions"
          :key="session.sessionId"
          :class="['chat-item', { active: currentSessionId === session.sessionId }]"
          @click="selectSession(session.sessionId)"
        >
          <div class="chat-item-content">
            <div class="chat-preview">{{ formatLastMessage(session.lastMessage) }}</div>
            <div class="chat-meta">
              <span>{{ session.messageCount }}条消息</span>
              <span>{{ formatTime(session.lastActiveTime) }}</span>
            </div>
          </div>
        </div>
        <div v-if="chatSessions.length === 0 && !sessionLoading" class="empty-sessions">
          <el-empty description="暂无历史会话" :image-size="60" />
        </div>
      </div>
    </div>

    <div class="chat-main">
      <div class="chat-header">
        <span class="chat-title">AI对话</span>
        <div class="chat-header-actions">
          <el-switch
            v-model="useStream"
            active-text="流式"
            inactive-text="同步"
            inline-prompt
            style="margin-right: 12px;"
          />
          <el-button link type="danger" @click="clearCurrentChat" v-if="messages.length > 0">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
        </div>
      </div>

      <div ref="chatContent" class="chat-content">
        <div v-if="messages.length === 0" class="empty-state">
          <div class="empty-icon">
            <el-icon :size="64" color="#c0c4cc"><ChatDotRound /></el-icon>
          </div>
          <p class="empty-text">开始与AI对话</p>
          <div class="suggestions">
            <el-tag
              v-for="(suggestion, index) in suggestions"
              :key="index"
              @click="sendMessage(suggestion)"
              class="suggestion-tag"
            >
              {{ suggestion }}
            </el-tag>
          </div>
        </div>

        <div v-for="(message, index) in messages" :key="index" :class="['message-item', message.role]">
          <div class="avatar">
            <el-icon v-if="message.role === 'user'" :size="20" color="#409eff"><User /></el-icon>
            <el-icon v-else :size="20" color="#67c23a"><Cpu /></el-icon>
          </div>
          <div class="message-content">
            <div v-if="message.content" class="message-text" v-html="formatMessage(message.content)"></div>
            <div v-else-if="message.role === 'assistant' && (isLoading || isStreaming)" class="loading-text">
              <span class="loading-dot"></span>
              <span class="loading-dot"></span>
              <span class="loading-dot"></span>
            </div>
            <div v-if="message.timestamp" class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
      </div>

      <div class="chat-input-area">
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="2"
          placeholder="输入消息，Enter 发送，Shift+Enter 换行，↑↓ 切换历史输入"
          @keydown.enter.exact.prevent="handleSend"
          @keydown.up.prevent="handleHistoryUp"
          @keydown.down.prevent="handleHistoryDown"
          :disabled="isLoading"
        />
        <el-button
          type="primary"
          :disabled="!inputMessage.trim() || isLoading"
          @click="handleSend"
        >
          <el-icon><Promotion /></el-icon>
        </el-button>
      </div>

      <div class="chat-footer">
        <span>AI 生成内容仅供参考，请注意甄别</span>
      </div>
    </div>
  </div>
</template>

<script setup name="AiChat">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, ChatDotRound, User, Cpu, Promotion } from '@element-plus/icons-vue'
import { listChatSessions, getChatHistory, deleteChatSession, sendChatMessageSync, sendChatMessageStream } from '@/api/ai/chat'

const chatContent = ref(null)
const inputMessage = ref('')
const isLoading = ref(false)
const isStreaming = ref(false)
const sessionLoading = ref(false)
const chatSessions = ref([])
const currentSessionId = ref(null)
const messages = ref([])
const useStream = ref(true)
let currentMsgIndex = -1
const inputHistory = ref([])
let historyIndex = -1
let typeTimer = null
let pendingContent = ''
let typeTargetIndex = -1

const suggestions = [
  '为高收入人群实时定价',
  '为新市民设计12期分期产品',
  '模拟利率上调1%的影响',
  '查询风控档位',
  '为自雇人士批量定价'
]

function formatLastMessage(text) {
  if (!text) return '新对话'
  const plain = text.replace(/\n/g, ' ').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/[#*`]/g, '')
  return plain.length > 25 ? plain.substring(0, 25) + '...' : plain
}

function formatTime(isoTime) {
  if (!isoTime) return ''
  try {
    const date = new Date(isoTime)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) {
      return date.toTimeString().substring(0, 5)
    }
    return `${date.getMonth() + 1}/${date.getDate()} ${date.toTimeString().substring(0, 5)}`
  } catch (e) {
    return isoTime
  }
}

function formatMessage(content) {
  if (!content) return ''
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

function startTypingEffect() {
  if (typeTimer) clearInterval(typeTimer)
  typeTimer = setInterval(() => {
    if (typeTargetIndex < 0 || typeTargetIndex >= messages.value.length) {
      clearInterval(typeTimer)
      typeTimer = null
      return
    }
    const msg = messages.value[typeTargetIndex]
    if (!msg) {
      clearInterval(typeTimer)
      typeTimer = null
      return
    }
    if (pendingContent.length > 0) {
      const char = pendingContent[0]
      pendingContent = pendingContent.slice(1)
      msg.content += char
      scrollToBottom()
    }
  }, 50)
}

function stopTypingEffect() {
  if (typeTimer) {
    clearInterval(typeTimer)
    typeTimer = null
  }
  if (typeTargetIndex >= 0 && typeTargetIndex < messages.value.length && pendingContent.length > 0) {
    messages.value[typeTargetIndex].content += pendingContent
    pendingContent = ''
    scrollToBottom()
  }
}

async function loadSessions() {
  sessionLoading.value = true
  try {
    const res = await listChatSessions()
    chatSessions.value = Array.isArray(res) ? res : []
    chatSessions.value.sort((a, b) => new Date(b.lastActiveTime) - new Date(a.lastActiveTime))
  } catch (e) {
    console.error('加载会话列表失败', e)
  } finally {
    sessionLoading.value = false
  }
}

async function selectSession(sessionId) {
  if (currentSessionId.value === sessionId || isLoading.value) return
  stopTypingEffect()
  pendingContent = ''
  currentSessionId.value = sessionId
  isLoading.value = true
  isStreaming.value = false
  messages.value = []
  currentMsgIndex = -1
  typeTargetIndex = -1
  try {
    const res = await getChatHistory(sessionId)
    messages.value = (res.messages || []).map(m => ({
      ...m,
      tools: []
    }))
    scrollToBottom()
  } catch (e) {
    ElMessage.error('加载历史消息失败')
  } finally {
    isLoading.value = false
  }
}

function handleNewChat() {
  stopTypingEffect()
  pendingContent = ''
  currentSessionId.value = null
  messages.value = []
  currentMsgIndex = -1
  typeTargetIndex = -1
  inputMessage.value = ''
}

async function handleSend() {
  const message = inputMessage.value.trim()
  if (!message || isLoading.value) return
  if (inputHistory.value.length === 0 || inputHistory.value[inputHistory.value.length - 1] !== message) {
    inputHistory.value.push(message)
  }
  historyIndex = -1
  await sendMessage(message)
}

function handleHistoryUp() {
  if (inputHistory.value.length === 0) return
  if (historyIndex === -1) {
    historyIndex = inputHistory.value.length - 1
  } else if (historyIndex > 0) {
    historyIndex--
  }
  inputMessage.value = inputHistory.value[historyIndex]
}

function handleHistoryDown() {
  if (inputHistory.value.length === 0 || historyIndex === -1) return
  if (historyIndex < inputHistory.value.length - 1) {
    historyIndex++
    inputMessage.value = inputHistory.value[historyIndex]
  } else {
    historyIndex = -1
    inputMessage.value = ''
  }
}

function createAssistantMessage() {
  return {
    role: 'assistant',
    intent: null,
    tools: [],
    content: '',
    timestamp: null
  }
}

async function sendMessage(message) {
  if (isLoading.value) return

  stopTypingEffect()
  pendingContent = ''

  inputMessage.value = ''
  messages.value.push({
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  })
  scrollToBottom()

  const data = { message }
  if (currentSessionId.value) {
    data.sessionId = currentSessionId.value
  }

  if (useStream.value) {
    await sendStreamMessage(data)
  } else {
    await sendSyncMessage(data)
  }
}

async function sendSyncMessage(data) {
  isLoading.value = true
  messages.value.push(createAssistantMessage())
  currentMsgIndex = messages.value.length - 1

  try {
    const res = await sendChatMessageSync(data)
    if (res.error) {
      ElMessage.error(res.error)
      messages.value[currentMsgIndex].content = res.error
      isLoading.value = false
      scrollToBottom()
      return
    }

    if (res.sessionId && !currentSessionId.value) {
      currentSessionId.value = res.sessionId
      loadSessions()
    }

    const replyContent = res.naturalReply || res.message || JSON.stringify(res, null, 2)
    messages.value[currentMsgIndex].content = replyContent
    messages.value[currentMsgIndex].timestamp = res.timestamp || new Date().toISOString()
    if (res.intent) {
      messages.value[currentMsgIndex].intent = res.intent
    }
  } catch (error) {
    messages.value[currentMsgIndex].content = '抱歉，我现在无法回答，请稍后重试。'
    ElMessage.error('发送失败，请重试')
  } finally {
    isLoading.value = false
    currentMsgIndex = -1
    scrollToBottom()
  }
}

async function sendStreamMessage(data) {
  isLoading.value = true
  isStreaming.value = true
  messages.value.push(createAssistantMessage())
  currentMsgIndex = messages.value.length - 1
  typeTargetIndex = currentMsgIndex
  pendingContent = ''
  startTypingEffect()

  try {
    await sendChatMessageStream(data, {
      onInit: (event) => {
        if (event.sessionId && !currentSessionId.value) {
          currentSessionId.value = event.sessionId
          loadSessions()
        }
      },
      onIntent: (event) => {
        if (currentMsgIndex >= 0 && currentMsgIndex < messages.value.length) {
          messages.value[currentMsgIndex].intent = event.intent
          scrollToBottom()
        }
      },
      onTool: (event) => {
        if (currentMsgIndex >= 0 && currentMsgIndex < messages.value.length) {
          const msg = messages.value[currentMsgIndex]
          msg.tools = [...msg.tools, event]
          scrollToBottom()
        }
      },
      onMessage: (event) => {
        const chunk = event.content || ''
        if (chunk) {
          pendingContent += chunk
        }
      },
      onEnd: (event) => {
        stopTypingEffect()
        if (currentMsgIndex >= 0 && currentMsgIndex < messages.value.length) {
          messages.value[currentMsgIndex].timestamp = new Date().toISOString()
        }
        isLoading.value = false
        isStreaming.value = false
        currentMsgIndex = -1
        typeTargetIndex = -1
        scrollToBottom()
        loadSessions()
      },
      onError: (event) => {
        stopTypingEffect()
        const errMsg = event.error || event.message || '流式请求失败'
        if (currentMsgIndex >= 0 && currentMsgIndex < messages.value.length) {
          messages.value[currentMsgIndex].content = errMsg
          messages.value[currentMsgIndex].timestamp = new Date().toISOString()
        }
        isLoading.value = false
        isStreaming.value = false
        currentMsgIndex = -1
        typeTargetIndex = -1
        ElMessage.error(errMsg)
        scrollToBottom()
      }
    })
  } catch (error) {
    stopTypingEffect()
    if (currentMsgIndex >= 0 && currentMsgIndex < messages.value.length) {
      const msg = messages.value[currentMsgIndex]
      if (!msg.content) {
        msg.content = '抱歉，连接中断，请稍后重试。'
      }
      msg.timestamp = new Date().toISOString()
    }
    isLoading.value = false
    isStreaming.value = false
    currentMsgIndex = -1
    typeTargetIndex = -1
    scrollToBottom()
  }
}

async function clearCurrentChat() {
  if (isLoading.value) return
  
  const sessionIdToDelete = currentSessionId.value
  
  stopTypingEffect()
  pendingContent = ''
  messages.value = []
  currentSessionId.value = null
  currentMsgIndex = -1
  typeTargetIndex = -1
  inputMessage.value = ''
  
  if (sessionIdToDelete) {
    try {
      const res = await deleteChatSession(sessionIdToDelete)
      ElMessage.success(res.message || '会话已结束')
      loadSessions()
    } catch (e) {
      console.error('删除会话失败', e)
      ElMessage.error('删除会话失败')
    }
  }
}

onMounted(() => {
  loadSessions()
  scrollToBottom()
})

onUnmounted(() => {
  stopTypingEffect()
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
    gap: 6px;
  }
}

.chat-history {
  flex: 1;
  overflow-y: auto;
}

.empty-sessions {
  padding: 20px 0;
}

.chat-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f2f5;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f7fa;
  }

  &.active {
    background-color: #ecf5ff;
    border-left: 3px solid #409eff;
    padding-left: 13px;
  }
}

.chat-item-content {
  overflow: hidden;
}

.chat-preview {
  font-size: 13px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.chat-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
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

.chat-header-actions {
  display: flex;
  align-items: center;
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
  max-width: 600px;

  .suggestion-tag {
    cursor: pointer;
    transition: all 0.2s;
    padding: 8px 12px;
    font-size: 14px;

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

    .avatar {
      margin-right: 0;
      margin-left: 12px;
    }

    .message-time {
      color: rgba(255, 255, 255, 0.7);
    }
  }

  &.assistant {
    .message-content {
      background: #fff;
      color: #303133;
      border-radius: 12px 12px 12px 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .avatar {
      margin-right: 12px;
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
}

.message-content {
  max-width: 75%;
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

  :deep(strong) {
    font-weight: 600;
  }
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
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

@keyframes loading {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.message-time {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
  text-align: right;
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
