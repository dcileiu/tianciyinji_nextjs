export default defineNuxtPlugin({
  name: "ant-design-vue",
  enforce: "pre",
  setup(nuxtApp) {
    // 确保只在客户端加载
    if (import.meta.client) {
      import("ant-design-vue").then((Antd) => {
        import("ant-design-vue/dist/reset.css");
        nuxtApp.vueApp.use(Antd.default);
      });
    }
  },
});

