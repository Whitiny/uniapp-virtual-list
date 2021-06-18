<template>
	<scroll-view scroll-y :scroll-top="scrollTop" :scroll-into-view="scrollId" @scroll="onScroll"
		@scrolltoupper="getData" class="scroll-view">

		<view class="text-center padding-tb-xs" style="color: #808080;">
			<text class="cuIcon-loading cuIconfont-spin margin-right-xs"></text>
			<text>加载中...</text>
		</view>
		<baizc-virtual-list ref="virtualList" :uniqueIds="uniqueIds" @change="onRangeChange">
			<view :style="{padding: vRange.padStyle}">
				<virtual-list-item v-for="(item, index) in visibleList" :key="item.id" :uid="item.id"
					@size="onEmitSize">

					<view v-if="item.type == 'small'" :id="'anchor' + item.id" style="padding: 7px 30rpx;">
						<view class="bg-white flex align-center padding" style="border-radius: 6px;">
							<image :src="item.image" mode="aspectFill" class="margin-right-sm"
								style="width: 70px; height: 50px; flex: none;"></image>
							<view class="" style="display: flex; flex-direction: column;">
								<view class="text-cut-2"
									style="margin-bottom: 5px; font-size: 32rpx; font-weight: bold;">
									{{ item.no }}、{{ item.title }}
								</view>
								<view class="">{{ item.passtime }}</view>
							</view>
						</view>
					</view>

					<view v-else :id="'anchor' + item.id" style="padding: 7px 30rpx;">
						<view class="bg-white solid-bottom padding" style="border-radius: 6px;">
							<view class="" style="display: flex; flex-direction: column;">
								<view class="text-cut-2"
									style="margin-bottom: 5px; font-size: 32rpx; font-weight: bold;">
									{{ item.no }}、{{ item.title }}
								</view>
							</view>
							<view class="flex align-center flex-between">
								<image :src="item.image" mode="" class="margin-right-sm"
									style="width: 70px; height: 65px; flex: 1;"></image>
								<image :src="item.image" mode="aspectFill" class="margin-right-sm"
									style="width: 70px; height: 65px; flex: 1;"></image>
								<image :src="item.image" mode="aspectFill" class=""
									style="width: 70px; height: 65px; flex: 1;">
								</image>
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
	import {
		getMockNews
	} from '@/common/mock.js';

	import virtualListMixin from '@/uni_modules/baizc-virtual-list/mixins/virtual-list.js';

	import {
		sleep
	} from '@/uni_modules/baizc-virtual-list/libs/util.js';

	export default {
		mixins: [
			virtualListMixin
		],
		data() {
			return {
				dataSources: [],
				scrollTop: 0,
				oldScrollTop: 0,
				scrollId: '',
				page: {
					num: 1,
					size: 30
				}
			};
		},
		onLoad: function() {
			this.getData().then(async () => {
				await this.$nextTick()
				// #ifndef H5
				await sleep(30)
				// #endif
				this.scrollTop = 99999;
			});
		},

		methods: {
			onScroll: function(e) {
				this.oldScrollTop = e.detail.scrollTop
			},
			getData: function() {
				if (this.isLoading) return;
				this.isLoading = true;

				let {
					num,
					size
				} = this.page;

				return new Promise((resolve) => {
					getMockNews(size, (num - 1) * size + 1)
						.then(async res => {
							this.$refs.virtualList.updateCacheByIndex(0); // 刷新缓存

							this.dataSources.unshift(...res.reverse());

							if (num !== 1) {
								// 需要回滚到新数据加载前位置
								let tempScrollId = 'anchor' + this.dataSources[res.length].id;

								await this.$nextTick();

								this.scrollId = tempScrollId;
							}

							this.page.num++;
							this.isLoading = false;

							resolve(res.length);
						})
				})
			},
		},
	};
</script>

<style>
	.scroll-view {
		height: calc(100vh - var(--window-top));
	}
</style>
