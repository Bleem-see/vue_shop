<template>
  <div>
    <el-button type="info" @click="goBack">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    goBack() {
      // 清空 token
      window.sessionStorage.clear()
      // 返回登陆页面
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>
</style>
