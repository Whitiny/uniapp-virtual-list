## 长列表优化 baizc-virtual-list

### 介绍

### 用前须知
1. app 端列表项模板不能用组件渲染，否则快速滚动时，会随机触发数据为 undefined 的情况
2. app 端会报错，但功能正常，猜测应该是数据快速变动，传递不及时，视图层、逻辑层两边不一致导致的
3. 小程序端列表模板可以用封装组件渲染，但是不应传递对象类型数据，应拆解出需要渲染的字段，一一传递，否则会出现图片闪烁的情况

### 使用示例
```html
<template>
	<baizc-virtual-list ref="virtualList" :uniqueIds="uniqueIds" @change="onRangeChange">
		<view :style="{ padding: vRange.padStyle }">
			<virtual-list-item v-for="item in visibleList" :uid="item.id" :key="item.id" @size="onEmitSize">
				
				<!-- 列表模板 -->
				
			</virtual-list-item>
		</view>
	</baizc-virtual-list>
</template>
<script>
	import virtualListMixin from '@/uni_modules/baizc-virtual-list/mixins/virtual-list.js';
	export default {
		mixins: [ virtualListMixin],
		onLoad: function() {
			this.getData();
		},
		methods: {
			getData: function() {
				// 获取数据 this.dataSources
			}
		},
		// ...
	}
</script>
```

### baizc-virtual-list 属性说明
|属性|类型|默认值|说明|
|--	|--	|--	|--	|
|uniqueIds |Array |[]	|数据源所有项的id集合	|
|keeps |Number |30	|实际渲染的数据条数，应大于三个屏幕高度/宽度	|
|estimateSize |Number |80	|估计的列表项平均大小，用于估算未渲染部分的占位 padding	|
|direction |String	|vertical	|声明列表横向还是纵向，可选值：vertical、horizontal	|
|componentId |String,Number	|''	|同个页面有多个列表时，确保id唯一，避免部分小程序中无法正确获取 dom、挂载 observer 监听器	|
|margin |Object |{}	|IntersectionObserver参数，用来扩展或收缩监测区域，一般用不到。[IntersectionObserver文档](https://uniapp.dcloud.io/api/ui/intersection-observer?id=intersectionobserver-%e5%af%b9%e8%b1%a1%e7%9a%84%e6%96%b9%e6%b3%95%e5%88%97%e8%a1%a8)	|

### virtual-list-item 属性说明
|属性|类型|默认值|说明|
|--	|--	|--	|--	|
|uid	|Number,String	|	|列表中数据项的唯一标识，与 uniqueIds 对应	|
|willRise	|Boolean	|false	|组件默认在 mounted 缓存列表项的大小，设置为 true 时，会在 updated 时也执行缓存。<br> 使用场景，例如：通过 item 上某个字段控制列表项收起/展开，导致列表项大小改变，需要更新缓存，否则后续更新计算会出错。<br> textarea 这种不会触发 updated 生命周期导致的表单项改变，需要通过 ref 主动调用组件中 `dispatchSizeChange` 方法更新缓存	|
|@size	|Function(Object)	|	|将列表项的 uid、宽度、高度传递出来，进行缓存	|


## 问题列表
### 问题一
- 方案：在虚拟列表组件内部进行可视的列表项数组构造以及 v-for 模板遍历，父组件通过 slot 传递列表单项模板，由`作用域插槽`获取列表项数据进行渲染，减少复用组件时的代码量
- 问题：小程序端，渲染的数组部分改变时，已渲染的列表项图片会闪烁一次
- 猜测：所有列表项都重新渲染了一遍，意味着了失去就地复用的优化；小程序的对象类型 props 参数传递，是通过 JSON 的 `stringfy`、`parse` 方法来实现的，所以任何通过跨组件数据渲染的模板都会变为全量更新
- 解决：将列表项的 v-for 遍历和列表模板渲染放置在同一组件层级

### 问题二
- 方案：基于`问题一`，列表的模板遍历在外部进行，不渲染的列表项高度在组件内用 padding 占位
- 问题：小程序端，渲染的数组部分改变时，所有列表项都会重新渲染一遍，表现为图片闪烁（刷新），也意味着失去就地复用的优化
- 猜测：小程序的对象类型 props 参数传递，是通过 JSON stringfy parse 处理来实现的，所以任何通过跨组件数据渲染的模板都会变为全量更新
- 解决：将列表项的 v-for 遍历和列表模板渲染放置在同一组件层级