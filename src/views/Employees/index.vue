<template>
  <div class="page-container">
    <h2>{{ title }}</h2>
    <p>页面开发中...</p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: '页面'
  }
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 24px;
}
</style>
