<template>
	<div :id="uid">
		<slot></slot>
	</div>
</template>

<script>
	import { sleep } from '../../libs/util.js';
	
	/**
	 * @description 为了精确计算当前滚动位置应该渲染哪些数据，需要缓存每个数据项的高度/宽度
	 * @property {Number,String} uid 列表中数据项的唯一标识
	 * @property {Boolean} willRise = [true|false] 当列表项大小会改变时，如展开、收起，需要设置为true，在组件updated时派发size,更新缓存
	 * @event {Function(Object)} size 将该列表项的节点信息size传递出去
	 * @example <virtual-list-item :uid="" @size=""></virtual-list-item>
	 */
	export default {
		name: 'virtual-list-item',
		props: {
			uid: {
				required: true,
				type: [Number, String],
			},
			index: {
				type: Number,
			},
			willRise: {
				type: Boolean,
				default: false
			}
		},
		mounted: function() {
			this.dispatchSizeChange();
		},
		updated: function() {
			if (this.willRise) this.dispatchSizeChange();
		},
		methods: {
			dispatchSizeChange: async function() {
				// #ifdef APP-PLUS
				await sleep(100);
				// #endif
				
				// #ifdef MP-ALIPAY
				let query = uni.createSelectorQuery().select(`#${this.uid}`);
				// #endif
				// #ifndef MP-ALIPAY
				let query = uni.createSelectorQuery().in(this).select(`#${this.uid}`);
				// #endif
				
				query.fields({
					size: true
				}, (res) => {
					this.$emit("size", {
						index: this.index,
						uid: this.uid,
						...res
					});
				}).exec()
			}
		},
	}
</script>

<style>
</style>
