<template>
	<view class="content">
		<mescroll-uni class="" ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="upCallback">
			<baizc-virtual-list ref="vsl" :dataSources="dataSources" @change="onRangeChange">
				<view class="" :style="{padding: `${range.padFront}px 0 ${range.padBehind}px`}">

					<virtual-list-item v-for="item in visibleList" :uid="item.id" :key="item.id" @size="onItemSize">
						
						<view v-if="item.type === 'small'" class="padding-lr padding-tb-sm">
							<view :key='item.id' class="bg-white flex align-center padding" style="border-radius: 6px;" >
								<image :src="item.image" mode="aspectFill" class="margin-right-sm"
									style="width: 70px; height: 50px; flex: none;"></image>
								<view class="" style="display: flex; flex-direction: column;">
									<view class="text-cut-2" style="margin-bottom: 5px; font-size: 32rpx; font-weight: bold;">
										{{item.no}}、{{item.title}}
									</view>
									<view class="">{{item.passtime}}</view>
								</view>
							</view>
						</view>
						
						<view v-else class="padding-lr padding-tb-sm">
							<view class="bg-white solid-bottom padding" style="border-radius: 6px;">
								<view class="" style="display: flex; flex-direction: column;">
									<view class="text-cut-2" style="margin-bottom: 5px; font-size: 32rpx; font-weight: bold;">
										{{item.no}}、{{item.title}}
									</view>
								</view>
								<view class="flex align-center flex-between">
									<image :src="item.image" mode="" class="margin-right-sm"
										style="width: 70px; height: 65px; flex: 1;"></image>
									<image :src="item.image" mode="aspectFill" class="margin-right-sm"
										style="width: 70px; height: 65px; flex: 1;"></image>
									<image :src="item.image" mode="aspectFill" class=""
										style="width: 70px; height: 65px; flex: 1;"></image>
								</view>
								<view class="margin-top-xs">{{item.passtime}}</view>
							</view>
						</view>

					</virtual-list-item>

				</view>
			</baizc-virtual-list>
		</mescroll-uni>
	</view>
</template>

<script>
	import newsItem from '@/components/news-item/news-item.vue';
	import mescrollUni from '@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-uni.vue';

	import mescrollMixin from '@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js'

	import {
		getMockNews
	} from '@/common/mock.js';

	export default {
		components: {
			newsItem,
			mescrollUni
		},
		mixins: [mescrollMixin],
		data() {
			return {
				dataSources: getMockNews(5000),
				// visibleList: [],
				range: {
					start: 0,
					end: 0,
					padFront: 0,
					padBehind: 0
				}
			}
		},
		computed: {
			visibleList() {
				try {
					return this.dataSources.slice(this.range.start, this.range.end + 1)
				} catch (e) {
					//TODO handle the exception
					console.error('catch', e)
				}
			}
		},
		onLoad() {},
		onReady() {},
		methods: {
			onRangeChange: function(range) {
				Object.assign(this.range, range)
			},
			onItemSize: function(uid, size) {
				this.$refs.vsl.saveSize(uid, size);
			}
		}
	}
</script>

<style>
	.content {}

	.scroll {
		height: calc(100vh - var(--window-top));
	}
	
	.text-cut-2 {
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
	}
</style>
