<template>
	<scroll-view
		scroll-y
		:scroll-top="scrollTop"
		:scroll-into-view="scrollId"
		@scrolltoupper="getData"
		class="scroll-view"
	>
		<view class="text-center padding-tb-xs" style="color: #808080;">
			<text class="cuIcon-loading cuIconfont-spin margin-right-xs"></text>
			<text>加载中...</text>
		</view>
		<baizc-virtual-list ref="virtualList" :uniqueIds="uniqueIds" @change="onRangeChange">
			<view :style="{ padding: vRange.padStyle }">
				<virtual-list-item
					v-for="(item, index) in visibleList"
					:key="item.uid"
					:index="vRange.start + index"
					:uid="item.uid"
					@size="onEmitSize"
				>
					<view v-if="item.type == 'small'" :id="'anchor' + item.uid" style="padding: 7px 30rpx;">
						<view class="bg-white flex align-center padding" style="border-radius: 6px;">
							<image
								:src="item.image"
								mode="aspectFill"
								class="margin-right-sm"
								style="width: 70px; height: 50px; flex: none;"
							></image>
							<view class="" style="display: flex; flex-direction: column;">
								<view class="text-cut-2" style="margin-bottom: 5px; font-size: 32rpx; font-weight: bold;">
									{{ item.no }}、{{ item.title }}
								</view>
								<view class="">{{ item.passtime }}</view>
							</view>
						</view>
					</view>

					<view v-else :id="'anchor' + item.uid" style="padding: 7px 30rpx;">
						<view class="bg-white solid-bottom padding" style="border-radius: 6px;">
							<view class="" style="display: flex; flex-direction: column;">
								<view class="text-cut-2" style="margin-bottom: 5px; font-size: 32rpx; font-weight: bold;">
									{{ item.no }}、{{ item.title }}
								</view>
							</view>
							<view class="flex align-center flex-between">
								<image
									:src="item.image"
									mode=""
									class="margin-right-sm"
									style="width: 70px; height: 65px; flex: 1;"
								></image>
								<image
									:src="item.image"
									mode="aspectFill"
									class="margin-right-sm"
									style="width: 70px; height: 65px; flex: 1;"
								></image>
								<image
									:src="item.image"
									mode="aspectFill"
									class=""
									style="width: 70px; height: 65px; flex: 1;"
								></image>
							</view>
							<view class="margin-top-xs">{{ item.passtime }}</view>
						</view>
					</view>
				</virtual-list-item>
			</view>
		</baizc-virtual-list>

		<!-- <button type="default" @tap="scrollIdTo" style="position:  fixed; bottom: 50px; left: 50%;">test</button> -->
	</scroll-view>
</template>

<script>
import { getMockNews } from '@/common/mock.js';

import { _ref, sleep } from '@/uni_modules/baizc-virtual-list/libs/util.js';

export default {
	data() {
		return {
			dataSources: [],
			scrollTop: 0,

			scrollId: '',
			page: {
				page: 1,
				size: 30
			},

			dataSources: [],
			vRange: {
				start: 0,
				end: 0,
				padStyle: '',
				padFront: 0,
				padBehind: 0
			}
		};
	},
	onLoad: function() {
		this.getData().then(async () => {
			await this.$nextTick();
			// #ifndef H5
			await sleep(30);
			// #endif
			this.scrollTop = 99999;
		});
	},
	computed: {
		uniqueIds() {
			return this.dataSources.map(item => item.uid);
		},
		visibleList() {
			return this.dataSources.slice(this.vRange.start, this.vRange.end + 1);
		}
	},
	methods: {
		onRangeChange: function(vRange) {
			Object.assign(this.vRange, vRange);
		},
		onEmitSize: function(data) {
			// 支付宝小程序中 模板上 ref 如果是嵌套的，$refs 获取到的结果也是嵌套的，需要自行递归去获取
			let vsl = _ref(this.$refs, 'virtualList');
			if (vsl) vsl.saveSize(data);

			// 列表循环会根据key复用，首页数据因数据量不够，可能会全部重新挂载，导致回滚失败
			if (data.uid === this.beforeViewId) this.scrollIntoView(this.beforeViewId);
		},
		scrollIntoView: async function(anchorId) {
			this.scrollId = '';

			await this.$nextTick();
			// #ifndef H5
			// await sleep(30);
			// #endif

			// 通过 scroll-into-view 回滚
			this.scrollId = 'anchor' + this.beforeViewId;
			console.log('anchorId', this.beforeViewId);
		},
		getData: function() {
			if (this.isLoading) return;
			this.isLoading = true;

			let { page, size } = this.page;

			return new Promise(resolve => {
				getMockNews(size, (page - 1) * size + 1).then(async res => {
					if (page !== 1) this.beforeViewId = this.dataSources[0].uid;

					this.dataSources.unshift(...res.reverse());

					// 需要回滚到新数据加载前位置
					if (this.beforeViewId) this.scrollIntoView(this.beforeViewId);

					this.page.page++;
					this.isLoading = false;

					resolve(res.length);
				});
			});
		}
	}
};
</script>

<style>
.scroll-view {
	height: calc(100vh - var(--window-top));
}
</style>
