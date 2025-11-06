<template>
  <footer class="site-footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>快速链接</h3>
          <ul class="footer-links">
            <li><router-link to="/">首页</router-link></li>
            <li><router-link to="/news">新闻</router-link></li>
            <!-- <li><router-link to="/blog">博客</router-link></li> -->
            <li><a href="https://blog.jiangyang.com" target="_blank">博客</a></li>
            <li><router-link to="/projects">项目</router-link></li>
          </ul>
        </div>

        <div class="footer-section">
          <h3>关于</h3>
          <ul class="footer-links">
            <li><router-link to="/about">个人简介</router-link></li>
          </ul>
        </div>

        <div class="footer-section">
          <h3>社交媒体</h3>
          <div class="social-icons">
            <a href="https://github.com/geekeryy" target="_blank" title="GitHub">
              <el-icon :size="24"><svg viewBox="0 0 1024 1024"><path d="M512 42.666667A464.64 464.64 0 0 0 42.666667 502.186667 460.373333 460.373333 0 0 0 363.52 938.666667c23.466667 4.266667 32-9.813333 32-22.186667v-78.08c-130.56 27.733333-158.293333-61.44-158.293333-61.44a122.026667 122.026667 0 0 0-52.053334-67.413333c-42.666667-28.16 3.413333-27.733333 3.413334-27.733334a98.56 98.56 0 0 1 71.68 47.36 101.12 101.12 0 0 0 136.533333 37.973334 99.413333 99.413333 0 0 1 29.866667-61.44c-104.106667-11.52-213.333333-50.773333-213.333334-226.986667a177.066667 177.066667 0 0 1 47.36-124.16 161.28 161.28 0 0 1 4.693334-121.173333s39.68-12.373333 128 46.933333a455.68 455.68 0 0 1 234.666666 0c89.6-59.306667 128-46.933333 128-46.933333a161.28 161.28 0 0 1 4.693334 121.173333A177.066667 177.066667 0 0 1 810.666667 477.866667c0 176.64-110.08 215.466667-213.333334 226.986666a106.666667 106.666667 0 0 1 32 85.333334v126.293333c0 14.933333 8.533333 26.88 32 22.186667A460.8 460.8 0 0 0 981.333333 502.186667 464.64 464.64 0 0 0 512 42.666667" fill="currentColor"/></svg></el-icon>
            </a>
            <a href="https://www.jiangyang.com" target="_blank" title="LinkedIn">
              <el-icon :size="24"><Link /></el-icon>
            </a>
            <a href="mailto:jiangyang.me@gmail.com" title="Email">
              <el-icon :size="24"><Message /></el-icon>
            </a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} 个人主页. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Link, Message } from '@element-plus/icons-vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.site-footer {
  background: #303133;
  color: #ffffff;
  padding: 40px 0 20px;
  margin-top: auto;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  margin-bottom: 30px;
}

.footer-section h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #409eff;
}

.footer-links {
  list-style: none;
}

.footer-links li {
  margin-bottom: 10px;
}

.footer-links a {
  color: #909399;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #ffffff;
}

.social-icons {
  display: flex;
  gap: 15px;
}

.social-icons a {
  color: #909399;
  transition: color 0.3s;
}

.social-icons a:hover {
  color: #409eff;
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #606266;
  color: #909399;
}

/* 响应式 */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}
</style>

