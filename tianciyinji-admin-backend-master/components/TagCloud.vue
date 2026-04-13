<template>
  <div class="tag-cloud-container">
    <svg :width="width" :height="height">
      <a class="fontA" v-for="(tag, index) in tags" :key="`tag-${index}`" :style="{ fill: tag.color }">
        <text :id="String(tag.id)" :x="tag.x" :y="tag.y" :font-size="16 * (600 / (600 - tag.z))" :fill-opacity="(400 + tag.z) / 600" @mousemove="listenerMove($event)" @mouseout="listenerOut($event)">
          {{ tag.text }}
        </text>
      </a>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";

interface Tag {
  id: number;
  title: string;
  key?: string;
  order?: number;
  isVisible?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface CloudTag {
  id: number;
  text: string;
  x: number;
  y: number;
  z: number;
  color: string;
}

const props = defineProps<{
  data: Tag[];
}>();

const containerRef = ref<HTMLDivElement>();
const width = ref(400);
const height = ref(400);
const tagsNum = ref(0);
const RADIUS = computed(() => Math.min(width.value, height.value) * 0.45);
const speedX = ref(Math.PI / 360 / 1.5);
const speedY = ref(Math.PI / 360 / 1.5);
const tags = ref<CloudTag[]>([]);

const timer = ref<number | null>(null);
const CX = computed(() => width.value / 2 - 40);
const CY = computed(() => height.value / 2);

// 启动旋转的函数
const startRotation = () => {
  if (tags.value.length > 0 && !timer.value) {
    runTags();
  }
};

// 监听 props.data 的变化
watch(
  () => props.data,
  (newData) => {
    if (newData && newData.length > 0) {
      initData();
      // 确保在数据初始化后启动旋转
      setTimeout(() => {
        startRotation();
      }, 100);
    }
  },
  { immediate: true }
);

// 监听容器大小变化
const updateDimensions = () => {
  if (containerRef.value) {
    requestAnimationFrame(() => {
      const container = containerRef.value;
      if (container) {
        const containerWidth = container.offsetWidth;
        width.value = Math.min(containerWidth, 400);
        height.value = width.value;
        initData();
        // 尺寸更新后确保旋转继续
        startRotation();
      }
    });
  }
};

// 添加 requestIdleCallback 的 polyfill
const requestIdleCallbackPolyfill = (callback: IdleRequestCallback): number => {
  const start = Date.now();
  return window.setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
    });
  }, 1);
};

const requestIdle = window.requestIdleCallback || requestIdleCallbackPolyfill;
const cancelIdle = window.cancelIdleCallback || window.clearTimeout;

let resizeObserver: ResizeObserver | null = null;
let idleCallbackId: number | null = null;

// 初始化 ResizeObserver
const initResizeObserver = () => {
  const container = document.querySelector<HTMLDivElement>(".tag-cloud-container");
  if (container) {
    containerRef.value = container;
    resizeObserver = new ResizeObserver((entries) => {
      // 取消之前的 idle callback
      if (idleCallbackId !== null) {
        cancelIdle(idleCallbackId);
      }

      // 使用 requestIdleCallback 延迟处理
      idleCallbackId = requestIdle(() => {
        if (!entries.length) return;
        requestAnimationFrame(() => {
          updateDimensions();
        });
      });
    });
    resizeObserver.observe(container);
    updateDimensions();
  }
};

// 清理 ResizeObserver
const cleanupResizeObserver = () => {
  if (resizeObserver && containerRef.value) {
    resizeObserver.unobserve(containerRef.value);
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (idleCallbackId !== null) {
    cancelIdle(idleCallbackId);
    idleCallbackId = null;
  }
};

function initData() {
  let tagsa: CloudTag[] = [];
  if (!props.data || props.data.length === 0) {
    tags.value = [];
    return;
  }

  tagsNum.value = props.data.length;
  for (let i = 0; i < props.data.length; i++) {
    let k = -1 + (2 * (i + 1) - 1) / tagsNum.value;
    let a = Math.acos(k);
    let b = a * Math.sqrt(tagsNum.value * Math.PI);

    tagsa.push({
      text: props.data[i].title,
      x: CX.value + RADIUS.value * Math.sin(a) * Math.cos(b),
      y: CY.value + RADIUS.value * Math.sin(a) * Math.sin(b),
      z: RADIUS.value * Math.cos(a),
      id: props.data[i].id,
      color: randomColor(),
    });
  }
  tags.value = tagsa;
}

const rotateX = (angleX: number) => {
  var cos = Math.cos(angleX);
  var sin = Math.sin(angleX);
  tags.value = tags.value.map((tag) => {
    var y1 = (tag.y - CY.value) * cos - tag.z * sin + CY.value;
    var z1 = tag.z * cos + (tag.y - CY.value) * sin;
    return { ...tag, y: y1, z: z1 };
  });
};

const rotateY = (angleY: number) => {
  var cos = Math.cos(angleY);
  var sin = Math.sin(angleY);
  tags.value = tags.value.map((tag) => {
    var x1 = (tag.x - CX.value) * cos - tag.z * sin + CX.value;
    var z1 = tag.z * cos + (tag.x - CX.value) * sin;
    return { ...tag, x: x1, z: z1 };
  });
};

const runTags = () => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
  timer.value = window.setInterval(() => {
    rotateX(speedX.value);
    rotateY(speedY.value);
  }, 17);
};

const listenerMove = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (target.id) {
    if (timer.value) {
      clearInterval(timer.value);
      timer.value = null;
    }
  }
};

const listenerOut = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (target.id) {
    runTags();
  }
};

function randomColor(): string {
  const letters = "0123456789ABCDEF";
  let color: string;
  do {
    color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
  } while (color === "#FFFFFF" || color === "#000000");
  return color;
}

onMounted(() => {
  initResizeObserver();
  // 确保组件挂载后启动旋转
  if (props.data && props.data.length > 0) {
    initData();
    setTimeout(() => {
      startRotation();
    }, 200);
  }
});

onUnmounted(() => {
  cleanupResizeObserver();
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
});
</script>

<style scoped>
.tag-cloud-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.fontA {
  fill: rgb(90, 188, 250);
  font-weight: bold;
  cursor: pointer;
}

.fontA:hover {
  fill: plum;
}
</style>
