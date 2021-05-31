<template>
	<view>
		<!-- 当设置tab-width,指定每个tab宽度时,则不使用flex布局,改用水平滑动 -->
		<me-tabs v-model="tabIndex" :tabs="tabs" :height="80"></me-tabs>
		<swiper :style="{height: height}" :current="tabIndex" @change="swiperChange">
			<swiper-item v-for="(tab,i) in tabs" :key="i">
				<mescroll-item :ref="'mescrollItem' + i" :i="i" :index="tabIndex" :tabs="tabs" :height="height">
				</mescroll-item>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	import MescrollItem from "./multiple-tabs_item.vue";

	export default {
		components: {
			MescrollItem
		},
		data() {
			return {
				height: "", // 需要固定swiper的高度
				tabs: ['选项卡A', '选项卡B', '选项卡C', '选项卡D'],
				tabIndex: 0 // 当前tab的下标
			}
		},
		onLoad() {
			// 需要固定swiper的高度 (需减去悬浮tabs的高度80rpx)
			this.height = uni.getSystemInfoSync().windowHeight - uni.upx2px(80) + 'px'
		},
		onPullDownRefresh: function() {
			// #ifdef MP-TOUTIAO
			let ref = this.$refs['mescrollItem' + this.tabIndex];
			if (ref.length === 0) return;
			ref = ref[0];
			if (ref && ref.refresh) {
				ref.refresh().then(() => uni.stopPullDownRefresh());
			}
			// #endif
		},
		methods: {
			// 轮播菜单
			swiperChange(e) {
				this.tabIndex = e.detail.current
			},
		}
	}
</script>

<style>
</style>
