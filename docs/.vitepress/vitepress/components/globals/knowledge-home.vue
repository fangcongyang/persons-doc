<script setup lang="ts">
import { ref } from 'vue'

/**
 * 首页功能分类配置
 * 定义了各个板块的标题、图标、描述及跳转链接
 */
const categories = [
  {
    title: 'Rust',
    icon: 'Odometer',
    desc: '高性能、安全系统的首选语言，掌握所有权机制与异步编程',
    link: '/en-US/rust/rust-start-quickly'
  },
  {
    title: 'Java',
    icon: 'Box',
    desc: '企业级应用开发、常用框架深入解析与最佳实践',
    link: '/en-US/java/env'
  },
  {
    title: 'System',
    icon: 'Monitor',
    desc: 'Linux/Windows 系统运维、常用命令与环境配置指南',
    link: '/en-US/system/linux/common-commands'
  },
  {
    title: 'Database',
    icon: 'Coin',
    desc: 'MySQL, PostgreSQL, SQLite 数据库管理与 SQL 标准',
    link: '/en-US/database/sql-standard'
  },
   {
    title: 'Middleware',
    icon: 'Connection',
    desc: 'Tomcat, Nginx 等中间件的配置、调优与故障排查',
    link: '/en-US/middleware/tomcat/base'
  },
  {
    title: 'Vue',
    icon: 'Brush',
    desc: '现代化前端开发、组件库使用与图表可视化方案',
    link: '/en-US/vue/echarts-line'
  }
]

/**
 * 页面跳转函数
 * @param path 目标路径
 */
function jump(path: string) {
  // 简单的页面跳转
  window.location.href = path
}
</script>

<template>
  <div class="knowledge-home">
    <div class="hero-section">
      <h1 class="title">f丿cy 知识库</h1>
      <p class="subtitle">沉淀编程语言、系统运维、数据库及常见问题的解决方案</p>
      <div class="actions">
        <el-button type="primary" size="large" round @click="jump('/en-US/rust/rust-start-quickly')">开始探索</el-button>
        <el-button size="large" round @click="jump('https://github.com/persons-doc')">GitHub</el-button>
      </div>
    </div>

    <div class="features-section">
      <div class="feature-grid">
        <div 
          v-for="item in categories" 
          :key="item.title" 
          class="feature-card"
          @click="jump(item.link)"
        >
          <div class="icon-wrapper">
             <!-- 动态渲染 Element Plus 图标 -->
             <component :is="item.icon" class="icon" />
          </div>
          <h3 class="card-title">{{ item.title }}</h3>
          <p class="card-desc">{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.knowledge-home {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  text-align: center;
  padding: 60px 0 80px;
  animation: fade-in 0.8s ease-out;
}

.title {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 24px;
  background: -webkit-linear-gradient(315deg, #42d392 25%, #647eff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
}

.subtitle {
  font-size: 22px;
  color: var(--el-text-color-secondary);
  margin-bottom: 48px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.features-section {
  margin-top: 20px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.feature-card {
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 16px;
  padding: 32px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  border-color: var(--el-color-primary-light-5);
}

/* 适配暗黑模式下的阴影 */
html.dark .feature-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.icon-wrapper {
  background-color: var(--el-color-primary-light-9);
  padding: 14px;
  border-radius: 12px;
  margin-bottom: 20px;
  color: var(--el-color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 28px;
  height: 28px;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
}

.card-desc {
  font-size: 15px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .title {
    font-size: 36px;
  }
  .subtitle {
    font-size: 18px;
  }
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
