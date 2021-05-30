<template>
	<div :id="uid">
		<slot></slot>
	</div>
</template>

<script>
	import { sleep } from '../../libs/util.js';
	
	export default {
		name: 'virtual-list-item',
		props: {
			uid: {
				required: true,
				type: [Number, String],
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
