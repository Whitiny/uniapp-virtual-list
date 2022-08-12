## 长列表优化 baizc-virtual-list

### 介绍
组件的原理是只渲染可见的部分列表，不可见的头尾部分通过 padding 占位撑开，减少页面dom节点以保障滚动的流畅性。主要实现思路来自 [vue-virtual-scroll-list](https://github.com/tangbc/vue-virtual-scroll-list/)，在其基础上，本组件做了以下改进：
1. 可见列表的更新计算由 `scroll` 事件监听改为使用 `IntersectionObserver` API 监听，也因此，组件内不含有 scroll-view ，可以与任意类似 mescroll 的封装组件搭配使用
2. 对可见列表的计算做了缓存（每一个列表项高度|宽度的顺次累加）。已缓存的部分，基于当前滚动位置通过二分查找得出当前应渲染的列表范围，以及顶部的 padding 占位大小，大幅减少计算量

### 用前须知
1. 组件提供了业务部分必要的代码的 mixins 对象封装，以尽可能的减少复用时的代码量
2. app 端列表项模板不能用组件渲染，否则快速滚动时，会随机触发数据为 undefined 的情况
2. app 端快速滚动时会报错，但功能正常，猜测应该是数据快速变动，传递不及时，视图层、逻辑层两边不一致导致的
3. 小程序端列表模板可以用封装组件渲染，但是不应传递对象类型数据，应拆解出需要渲染的字段，一一传递，否则会出现图片闪烁的情况
4. 对于列表项高度不固定的情况：如果快速的滚动到后面，在往回滚，会出现抖动现象。这是因为前面的列表项来不及渲染高度没有被缓存，padding 是以估算的平均值计算的，实际列表项的高度和平均值的偏差导致了抖动。

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
|keeps |Number |50	|实际渲染的数据条数	|
|estimateSize |Number |80	|估计的列表项平均大小，用于估算未渲染部分的占位 padding；不需要精确数值，首屏渲染后，会根据列表项实际大小进行估算	|
|direction |String	|vertical	|声明列表横向还是纵向，可选值：vertical、horizontal	|
|componentId |String,Number	|''	|同个页面有多个列表时，确保id唯一，避免部分小程序中无法正确获取 dom、挂载 observer 监听器	|
|margin |Object |{}	|IntersectionObserver参数，用来扩展或收缩监测区域，一般不需要修改。[IntersectionObserver文档](https://uniapp.dcloud.io/api/ui/intersection-observer?id=intersectionobserver-%e5%af%b9%e8%b1%a1%e7%9a%84%e6%96%b9%e6%b3%95%e5%88%97%e8%a1%a8)	|
|@change |Event	|	|通知要更新渲染的数组下标范围，以及 padding 占位样式	|

### virtual-list-item 属性说明
|属性|类型|默认值|说明|
|--	|--	|--	|--	|
|uid	|Number,String	|	|列表中数据项的唯一标识，与 uniqueIds 对应	|
|willResize	|Boolean	|false	|组件默认在 mounted 缓存列表项的大小，设置为 true 时，会在 updated 时也触发缓存事件。<br> 使用场景，例如：通过 item 上某个字段控制列表项收起/展开，导致列表项大小改变，需要更新缓存，否则后续更新计算会出错。<br> textarea 这种不会触发 updated 生命周期导致的列表项大小改变，需要通过 ref 主动调用组件中 `dispatchSizeChange` 方法更新缓存	|
|@size	|Event	|	|将列表项的 uid、宽度、高度传递出来，进行缓存	|

### GIF 演示
![demo](https://raw.githubusercontent.com/Whitiny/imagesRepo/master/uni-virtual-list/1.gif)
![固定高度列表](https://raw.githubusercontent.com/Whitiny/imagesRepo/master/uni-virtual-list/2.gif)
![动态高度列表](https://raw.githubusercontent.com/Whitiny/imagesRepo/master/uni-virtual-list/3.gif)
![横向列表](https://raw.githubusercontent.com/Whitiny/imagesRepo/master/uni-virtual-list/4.gif)
![多选项卡列表](https://raw.githubusercontent.com/Whitiny/imagesRepo/master/uni-virtual-list/5.gif)