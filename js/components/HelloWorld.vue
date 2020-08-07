<template>
  <span>Hello, World!</span>
</template>

<script>
module.exports = {
  mounted () {
    console.log('Hello, World!')
  }
}
</script>

<style scoped>
  span {
    background-color: yellow;
  }
</style>
