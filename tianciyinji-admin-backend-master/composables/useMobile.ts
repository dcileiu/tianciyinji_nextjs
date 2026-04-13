import { ref, onMounted, onUnmounted } from "vue";

export const useMobile = () => {
  const isMobile = ref(false);

  const checkMobile = () => {
    isMobile.value = typeof window !== "undefined" && window.innerWidth < 768;
  };

  onMounted(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", checkMobile);
  });

  return { isMobile };
};
