<template>
  <div class="doc-viewer-container">
    <div v-loading="loading" class="doc-content">
      <div v-if="loading" class="loading-placeholder"></div>
      <div v-else-if="error" class="error-tip">
        <el-empty :description="error" />
      </div>
      <div v-else class="doc-html" v-html="htmlContent"></div>
    </div>
  </div>
</template>

<script setup name="AboutRequirement">
import { ref, onMounted } from 'vue'
import mammoth from 'mammoth'

const loading = ref(true)
const error = ref('')
const htmlContent = ref('')

async function loadDoc() {
  loading.value = true
  error.value = ''
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}docs/requirement.docx`)
    if (!response.ok) throw new Error('文件加载失败')
    const arrayBuffer = await response.arrayBuffer()
    const result = await mammoth.convertToHtml({ arrayBuffer })
    htmlContent.value = result.value || '<p>文档内容为空</p>'
  } catch (e) {
    console.error('文档加载失败', e)
    error.value = '文档加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDoc()
})
</script>

<style scoped>
.doc-viewer-container {
  background: #fff;
  border-radius: 8px;
  padding: 40px 60px;
  min-height: calc(100vh - 160px);
}

.doc-content {
  min-height: 400px;
}

.loading-placeholder {
  min-height: 400px;
}

.error-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.doc-html {
  line-height: 1.8;
  font-size: 14px;
  color: #303133;
}

.doc-html :deep(h1) {
  font-size: 24px;
  font-weight: 700;
  margin: 20px 0 12px;
}

.doc-html :deep(h2) {
  font-size: 20px;
  font-weight: 600;
  margin: 18px 0 10px;
}

.doc-html :deep(h3) {
  font-size: 16px;
  font-weight: 600;
  margin: 14px 0 8px;
}

.doc-html :deep(p) {
  margin: 8px 0;
}

.doc-html :deep(ul),
.doc-html :deep(ol) {
  padding-left: 24px;
  margin: 8px 0;
}

.doc-html :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
}

.doc-html :deep(td),
.doc-html :deep(th) {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}

.doc-html :deep(th) {
  background: #f5f7fa;
  font-weight: 600;
}

.doc-html :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 12px 0;
  border-radius: 4px;
}

.doc-html :deep(pre) {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 12px;
  overflow-x: auto;
  margin: 8px 0;
}

.doc-html :deep(code) {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
}
</style>
