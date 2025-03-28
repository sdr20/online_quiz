<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    this.$store.dispatch('initializeUser');
  },
};
</script>

<style>
/* Add global styles if needed */
</style>