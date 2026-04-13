<script setup lang="ts">
// @ts-ignore Nuxt auto-import
definePageMeta({});

// @ts-ignore Nuxt auto-import
useHead({
  title: "首页 - 天赐印记后台",
});

const router = useRouter();

onMounted(() => {
  router.replace("/dashboard");
});
</script>

<template>
  <div />
</template>
