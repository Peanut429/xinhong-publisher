# 批量文章生成脚本

这个脚本系统用于自动化生成小红书文章内容，支持多个账号的批量处理和重试机制。

## 功能特性

- 🚀 **批量生成**: 支持为所有账号批量生成文章
- 🔄 **重试机制**: 自动重试失败的请求，最大重试次数可配置
- ⏱️ **智能延迟**: 请求间自动添加延迟，避免 API 过载
- 📊 **进度跟踪**: 实时显示生成进度和统计信息
- 💾 **结果保存**: 自动保存生成的文章和详细日志
- 📝 **详细日志**: 记录成功和失败的详细信息

## 账号配置

系统支持以下 6 个账号：

| 账号名称 | 电话号码    | 备注       |
| -------- | ----------- | ---------- |
| 王娜     | 15639880395 | -          |
| 王佳玲   | 13142102709 | 默认账号   |
| 萤火     | 18901643836 | -          |
| 七月     | 18901764336 | -          |
| 小李说车 | 13386027991 | 汽车类内容 |
| 梅子说车 | 18918722354 | 汽车类内容 |

## 使用方法

### 1. 快速开始 (推荐)

```bash
# 为默认账号(王佳玲)生成1篇文章
npm run generate:quick

# 为指定账号生成文章
npm run generate:quick -- --account 王娜 --count 3

# 为所有账号各生成2篇文章
npm run generate:quick -- --account all --count 2

# 查看帮助信息
npm run generate:help
```

### 2. 批量生成所有账号

```bash
# 为所有账号各生成5篇文章 (完整模式)
npm run generate:all
```

### 3. 直接使用脚本

```bash
# 快速生成
node scripts/quick-generate.js --account 王娜 --count 2

# 批量生成
node scripts/batch-generate-articles.js
```

## 参数说明

### quick-generate.js 参数

- `--account <账号名称>`: 指定要生成文章的账号名称，或使用 `all` 表示所有账号
- `--count <数量>`: 每个账号生成的文章数量 (默认: 1)
- `--help`: 显示帮助信息

### 示例命令

```bash
# 为王娜生成3篇文章
node scripts/quick-generate.js --account 王娜 --count 3

# 为所有汽车类账号生成文章
node scripts/quick-generate.js --account 小李说车 --count 2
node scripts/quick-generate.js --account 梅子说车 --count 2

# 为所有账号各生成1篇文章
node scripts/quick-generate.js --account all --count 1
```

## 配置选项

在 `batch-generate-articles.js` 中可以修改以下配置：

```javascript
const CONFIG = {
  ARTICLES_PER_ACCOUNT: 5, // 每个账号生成的文章数量
  MAX_RETRIES: 3, // 最大重试次数
  RETRY_DELAY: 2000, // 重试延迟（毫秒）
  REQUEST_DELAY: 3000, // 请求间延迟（毫秒）
  API_URL: "http://localhost:3000/api/write-note-enhanced",
  LOG_FILE: "batch-generate-log.json",
};
```

## 输出结果

### 文件保存

- 📁 **生成的文章**: 保存在 `scripts/generated-articles/` 目录
- 📋 **执行日志**: 保存为 `scripts/batch-generate-log.json`
- 📊 **总结报告**: 保存为 `scripts/batch-generate-summary.json`

### 文章文件命名

```
王娜-article-1-2024-01-15T08:30:15-123Z.json
```

格式: `{账号名称}-article-{序号}-{时间戳}.json`

### 文章文件内容

```json
{
  "accountName": "王娜",
  "articleIndex": 1,
  "timestamp": "2024-01-15T08:30:15.123Z",
  "title": "文章标题",
  "content": "文章内容",
  "sellingPoint": "卖点段落",
  "topics": ["话题1", "话题2"],
  "imageUrl": "https://qianyi-aigc.tos-cn-shanghai.volces.com/image.jpg",
  "rawData": {
    /* 完整API返回数据 */
  }
}
```

## 日志和监控

### 控制台输出

```
🚀 开始处理账号: 王娜 (e61149df-e288-47f7-8ab6-111ddf145505)
📱 电话号码: 15639880395

📝 生成第 1/5 篇文章...
✅ 文章生成成功: 冬日暖阳下的美好时光
💾 保存路径: scripts/generated-articles/王娜-article-1-...json

⏳ 等待 3s 后继续...
```

### 成功率统计

脚本会自动计算并显示：

- ✅ 成功文章数量
- ❌ 失败文章数量
- 📈 整体成功率
- ⏱️ 总执行时间

## 错误处理

### 重试机制

- 自动重试失败的 API 调用
- 指数退避延迟策略
- 详细错误日志记录

### 常见错误

1. **API 调用失败**: 检查网络连接和 API 服务状态
2. **参数错误**: 确认账号名称和参数格式正确
3. **权限问题**: 确保有写入文件的权限

## 性能优化

### 推荐配置

- **开发环境**: `REQUEST_DELAY: 2000` (2 秒)
- **生产环境**: `REQUEST_DELAY: 5000` (5 秒)
- **测试少量**: 使用 `quick-generate.js`
- **批量生产**: 使用 `batch-generate-articles.js`

### 注意事项

⚠️ **重要提醒**:

- 请确保 Next.js 开发服务器正在运行 (`npm run dev`)
- 避免同时运行多个脚本实例
- 生成大量文章时建议分批进行
- 定期检查 API 配额和限制

## 故障排除

### 1. 脚本无法运行

```bash
# 检查Node.js版本
node --version

# 确保在项目根目录
pwd
```

### 2. API 调用失败

```bash
# 检查开发服务器是否运行
curl http://localhost:3000/api/write-note-enhanced

# 查看服务器日志
npm run dev
```

### 3. 权限错误

```bash
# 检查目录权限
ls -la scripts/

# 创建必要目录
mkdir -p scripts/generated-articles
```

## 更新日志

- **v1.0.0**: 初始版本，支持批量生成和重试机制
- **v1.1.0**: 添加快速生成脚本和 npm 命令
- **v1.2.0**: 优化日志记录和错误处理
