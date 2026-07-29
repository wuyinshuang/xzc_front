<template>
  <div class="pdf-viewer-container">
    <iframe
      :src="pdfUrl"
      class="pdf-iframe"
      frameborder="0"
    ></iframe>
  </div>
</template>

<script setup name="AboutPresentation">
import { ref } from 'vue'

const pdfUrl = ref(`${import.meta.env.BASE_URL}docs/presentation.pdf`)
</script>

<style scoped>
.pdf-viewer-container {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  min-height: calc(100vh - 160px);
}

.pdf-iframe {
  width: 100%;
  height: calc(100vh - 160px);
  border: none;
  display: block;
}
</style>
