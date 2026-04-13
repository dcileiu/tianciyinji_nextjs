# Nuxt 项目部署到宝塔面板指南

## 前置准备

### 1. 在宝塔面板安装 Node.js 版本管理器

1. 打开宝塔面板 → **软件商店** → 搜索 **Node.js 版本管理器**
2. 安装 **Node.js 版本管理器**
3. 安装完成后，在 **软件商店** → **已安装** → 找到 **Node.js 版本管理器** → **设置**
4. **重要：** 安装 **Node.js 22.12.0** 或更高版本（Nuxt 4.3.1 要求 `^20.19.0 || >=22.12.0`）
   - 或者安装 **Node.js 20.19.0** 或更高版本（20.x LTS）

### 2. 安装 pnpm（如果还没有）

在服务器 SSH 终端执行：

```bash
npm install -g pnpm
```

或者使用宝塔的终端执行。

---

## 部署步骤

### 步骤 1：上传项目文件到服务器

**方法 A：使用宝塔文件管理器**

1. 打开宝塔面板 → **文件**
2. 进入 `/www/wwwroot/` 目录
3. 创建新文件夹：`nuxt-admin-backend`
4. 上传你的项目文件（压缩后上传，然后在服务器解压）

**方法 B：使用 Git（推荐）**

在服务器 SSH 终端执行：

```bash
cd /www/wwwroot/
git clone <你的仓库地址> nuxt-admin-backend
cd nuxt-admin-backend/nuxt-admin-backend
```

**方法 C：使用 SCP/SFTP**

从你电脑上传整个项目文件夹到服务器的 `/www/wwwroot/nuxt-admin-backend/` 目录。

---

### 步骤 2：安装项目依赖

在服务器 SSH 终端执行：

```bash
cd /www/wwwroot/nuxt-admin-backend/nuxt-admin-backend
pnpm install --production=false
```

---

### 步骤 3：配置环境变量

1. 在项目根目录创建 `.env` 文件：

```bash
cd /www/wwwroot/nuxt-admin-backend/nuxt-admin-backend
nano .env
```

2. 添加以下内容（根据你的实际情况修改）：

```env
# 数据库配置（现在使用 localhost，因为 Nuxt 在服务器上运行）
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=itianci
DB_PASSWORD=zAfcfAL6JNa5cysW
DB_NAME=itianci

# JWT 配置
JWT_SECRET=你的JWT密钥（建议使用随机字符串）
JWT_EXPIRES_IN=7d

# 图片上传配置（如果需要）
SMMS_TOKEN=你的SMMS_TOKEN
```

3. 保存文件（`Ctrl + O`，然后 `Enter`，最后 `Ctrl + X` 退出）

---

### 步骤 4：构建项目

在服务器 SSH 终端执行：

```bash
cd /www/wwwroot/nuxt-admin-backend/nuxt-admin-backend
pnpm build
```

构建完成后，会生成 `.output` 目录。

---

### 步骤 5：使用 PM2 启动项目

**方法 A：使用宝塔的 PM2 管理器（推荐）**

1. 打开宝塔面板 → **软件商店** → 搜索 **PM2 管理器**
2. 安装 **PM2 管理器**
3. 安装完成后，打开 **PM2 管理器**
4. 点击 **添加项目**
5. 配置如下：
   - **项目名称**：`nuxt-admin-backend`
   - **项目路径**：`/www/wwwroot/nuxt-admin-backend/nuxt-admin-backend`
   - **启动文件**：`.output/server/index.mjs`
   - **项目端口**：`3001`（或你想要的端口）
   - **运行模式**：`生产模式`
6. 点击 **提交**

**方法 B：使用命令行 PM2**

1. 安装 PM2（如果还没有）：

```bash
npm install -g pm2
```

2. 使用项目根目录的 `ecosystem.config.js` 启动：

```bash
cd /www/wwwroot/nuxt-admin-backend/nuxt-admin-backend
pm2 start ecosystem.config.js
```

3. 设置 PM2 开机自启：

```bash
pm2 save
pm2 startup
```

---

### 步骤 6：配置 Nginx 反向代理

1. 打开宝塔面板 → **网站** → **添加站点**
2. 填写：
   - **域名**：`admin.yourdomain.com`（或你的域名）
   - **备注**：`Nuxt Admin Backend`
   - **根目录**：`/www/wwwroot/nuxt-admin-backend/nuxt-admin-backend/.output/public`
   - **PHP版本**：**纯静态**
3. 点击 **提交**

4. 配置反向代理：
   - 点击站点右侧的 **设置**
   - 点击 **反向代理** → **添加反向代理**
   - 配置如下：
     - **代理名称**：`nuxt-api`
     - **目标URL**：`http://127.0.0.1:3001`
     - **发送域名**：`$host`
     - **缓存**：关闭
   - 点击 **提交**

5. 修改网站配置（点击 **设置** → **配置文件**）：

找到 `location /` 部分，修改为：

```nginx
location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

保存配置。

---

### 步骤 7：配置防火墙

1. 打开宝塔面板 → **安全**
2. 确保端口 **3001**（或你使用的端口）已开放
3. 如果使用域名访问，确保 **80** 和 **443** 端口已开放

---

### 步骤 8：测试部署

1. 访问你的域名：`http://admin.yourdomain.com` 或 `http://你的服务器IP:3001`
2. 应该能看到登录页面
3. 尝试登录，检查是否能正常连接数据库

---

## 常见问题

### 1. PM2 启动失败

检查日志：

```bash
pm2 logs nuxt-admin-backend
```

或查看宝塔 PM2 管理器中的日志。

### 2. 端口被占用

修改 `ecosystem.config.js` 中的端口号，或停止占用端口的进程。

### 3. 数据库连接失败

- 确认 `.env` 文件中的数据库配置正确
- 确认 `DB_HOST=127.0.0.1`（本地连接）
- 确认 `itianci` 用户有 `localhost` 权限

### 4. 构建失败

检查 Node.js 版本：

```bash
node -v  # 应该是 18.x 或更高
pnpm -v
```

### 5. 静态资源 404

确保 Nginx 配置正确，或者使用 Nuxt 的静态文件服务。

---

## 更新部署

当代码更新后：

```bash
cd /www/wwwroot/nuxt-admin-backend/nuxt-admin-backend
git pull  # 如果使用 Git
pnpm install
pnpm build
pm2 restart nuxt-admin-backend
```

---

## 查看日志

```bash
# PM2 日志
pm2 logs nuxt-admin-backend

# 实时日志
pm2 logs nuxt-admin-backend --lines 100
```
