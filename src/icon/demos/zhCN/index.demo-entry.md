# 图标 Icon

naive-ui 推荐使用 [xicons](https://www.xicons.org) 作为图标库。

## 演示

```demo
basic.vue
custom-icon.vue
depth.vue
```

## API

### Icon Props

| 名称 | 类型 | 默认值 | 说明 | 版本 |
| --- | --- | --- | --- | --- |
| color | `string` | `undefined` | 图标颜色 |
| depth | `1 \| 2 \| 3 \| 4 \| 5` | `undefined` | 图标深度 |
| size | `number \| string` | `undefined` | 图标大小（当不指定单位时，默认单位: `px`） |
| icon | `Component` | `undefined` | 指定引入图标 |
| component | `Component` | `undefined` | 要展示的图标组件 | 2.24.6 |

### Icon Slots

| 名称    | 参数 | 说明       |
| ------- | ---- | ---------- |
| default | `()` | 图标的内容 |
