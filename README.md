# demo

#### **线上地址**：

---

## 目录结构

-   `fake/user.js`: 存放一些登录的账号信息
-   `role/role.js`: 存放一些角色对应的页面地址
-   `router/index.js`: 存放页面地址对应的页面以及登录拦截
-   `store/index.js`: 存放一些全局的状态管理比如：登录状态，下拉选项框内容
-   `utils`
    -   `myxlsx.js`: excel 表格的一些关于解析表格，导出表格的处理函数
    -   `num.js`: 放跟一些数字有关的处理函数
    -   `storage.js`: 放一些本地存储相关的函数
-   `views` 页面文件

    -   `college/index.vue`: 学院资源页面
    -   `export/index.vue`: 数据导出页面
    -   `login/index.vue`: 登录页面
    -   `office/index.vue`: 分办公室资源页面
    -   `standard/index.vue`: 分配标准页面

-   `layout`: 存放一些页面框架的整体布局，比如侧边栏，头部栏，主内容栏

---

## ⚒ 项目调试和打包

```
pnpm install
```

### 调试项目

```
pnpm run serve
```

### 编译和打包项目

```
pnpm run build
```
