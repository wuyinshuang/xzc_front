<template>
  <div>
    <svg-icon icon-class="question" @click="goto" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

function goto() {
  router.push('/about/index/doc')
}
</script>