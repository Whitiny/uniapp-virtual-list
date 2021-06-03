<template>
	<scroll-view scroll-y :scroll-top="scrollTop.value" :scroll-into-view="scrollId" @scroll="onScroll" @scrolltoupper="getData()"
		:style="{height: 'calc(100vh - var(--window-top))'}">
		<view class="text-center padding-tb-xs" style="color: #808080;">
			<text class="cuIcon-loading cuIconfont-spin margin-right-xs"></text>
			<text>加载中...</text>
		</view>
		<baizc-virtual-list ref="virtualList" :dataSources="dataSources">
			<template v-slot:default="{item}">

				<view v-if="true" style="padding: 7px 30rpx;">
					<view class="bg-white flex align-center padding" style="border-radius: 6px;">
						<image :src="item.image" mode="aspectFill" class="margin-right-sm"
							style="width: 70px; height: 50px; flex: none;"></image>
						<view class="" style="display: flex; flex-direction: column;">
							<view class="text-cut-2" style="margin-bottom: 5px; font-size: 32rpx; font-weight: bold;">
								{{ item.no }}、{{ item.title }}
							</view>
							<view class="">{{ item.passtime }}</view>
						</view>
					</view>
				</view>

				<view v-else style="padding: 7px 30rpx;">
					<view class="bg-white solid-bottom padding" style="border-radius: 6px;">
						<view class="" style="display: flex; flex-direction: column;">
							<view class="text-cut-2" style="margin-bottom: 5px; font-size: 32rpx; font-weight: bold;">
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

			</template>
		</baizc-virtual-list>
	</scroll-view>
</template>

<script>
	import {
		getMockNews
	} from '@/common/mock.js';

	import {
		sleep
	} from '@/uni_modules/baizc-virtual-list/libs/util.js';

	export default {
		data() {
			return {
				dataSources: [],
				scrollTop: {
					old: 0,
					value: 0
				},
				scrollId: '',
				isLoading: false,
				page: {
					num: 1,
					size: 30
				}
			};
		},
		onLoad: function() {
			this.getData().then(async () => {
				await this.$nextTick()
				// await sleep(300)
				this.scrollTop.value = 10000;
				this.isLoading = false;
			});
		},

		methods: {
			onScroll: function(e) {
				this.scrollTop.old = e.detail.scrollTop
			},
			getData: function() {
				console.log('isload', this.isLoading);
				if (this.isLoading) return;
				this.isLoading = true;

				let {
					num,
					size
				} = this.page;

				return new Promise((resolve) => {
					getMockNews(size, (num - 1) * size + 1)
						.then(res => {
							this.$refs.virtualList.updateCacheByIndex(0); // 刷新缓存

							this.dataSources.unshift(...res.reverse());
							this.page.num++;

							if (num !== 1) {
								this.$refs.virtualList.afterMountedHeadData(this.page.size, async (offset) => {

									this.scrollTop.value = this.scrollTop.old;

									await this.$nextTick();
									this.scrollTop.value = offset;

									this.isLoading = false;
								})
							}
							console.log(this.isLoading);
							resolve(res.length);
						})
				})
			},
		},
	};
</script>

<style></style>
