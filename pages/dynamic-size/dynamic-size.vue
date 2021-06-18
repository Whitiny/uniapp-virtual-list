<template>
	<view class="content">
		<mescroll-body ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="upCallback">
			<baizc-virtual-list ref="virtualList" :uniqueIds="uniqueIds" @change="onRangeChange">
				<view :style="{ padding: vRange.padStyle }">
					<virtual-list-item willResize v-for="(item, index) in visibleList" :index="vRange.start + index"
						:uid="item.id" :key="item.id" @size="onEmitSize">

						<view :class="['card-container', item.type]" @tap="changeType(item)">
							<view class="card padding shadow">

								<view class="image-box flex align-center flex-between">
									<image :src="item.image" mode="aspectFill" class="image"></image>
									<image v-if="item.type !== 'small'" :src="item.image" mode="aspectFill"
										class="image"></image>
									<image v-if="item.type !== 'small'" :src="item.image" mode="aspectFill"
										class="image"></image>
								</view>

								<view class="title-box flex flex-direction">
									<view class="title text-cut-2">
										{{ item.no }}、{{ item.title }}
									</view>

									<view class="time">{{ item.passtime }}</view>
								</view>

							</view>
						</view>
						
					</virtual-list-item>
				</view>
			</baizc-virtual-list>
		</mescroll-body>
	</view>
</template>

<script>
	import mescrollUni from '@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-uni.vue';

	import virtualListMixin from '@/uni_modules/baizc-virtual-list/mixins/virtual-list.js';
	import mescrollMixin from '@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js';

	import {
		getMockNews
	} from '@/common/mock.js';

	export default {
		components: {
			mescrollUni
		},
		mixins: [mescrollMixin, virtualListMixin],
		data() {
			return {};
		},
		onLoad: function() {
			this.getData();
		},
		methods: {
			getData: async function() {
				try {
					let res = await getMockNews(10000);
					this.dataSources.push(...res)
					this.mescroll.endSuccess(res.length, false)
				} catch (e) {
					this.mescroll.endErr();
				}
			},
			changeType: function(item) {
				item.type = item.type === 'small' ? 'medium' : 'small'
			}
		},
	};
</script>

<style>
	.card-container {
		padding: 7px 30rpx;
	}

	.card-container .card {
		background-color: white;
		border-radius: 6px;
		position: relative;
		
		height: calc(196.8rpx + 65px);
		transition: height .3s;
	}
	
	.image-box {
		position: absolute;
		top: 123.2rpx;
		width: calc(100% - 60rpx);
		
		transition: all .3s;
	}

	.image-box .image {
		flex: 1 1 90px;
		height: 65px;
		margin-right: 20rpx;
		border-radius: 3px;
	}
	
	.image-box .image:last-child {
		margin: 0;
	}
	
	.title-box {
		transition: padding .3s;
	}

	.title-box .title {
		margin-bottom: calc(65px + 20rpx);
		font-size: 32rpx;
		line-height: 1.3;
		height: 83.2rpx;
		font-weight: bold;
	}
	
	.title-box .time {
		font-size: 28rpx;
		line-height: 1.2;
		height: 33.6rpx;
	}
	
	.card-container.small .card {
		height: 196.8rpx;
	}
	
	.card-container.small .image-box {
		width: 90px;
		margin-right: 20rpx;
		top: 50%;
		transform: translate(0, -50%);
	}
	
	.card-container.small .title-box .title{
		margin-bottom: 20rpx;
	}
	
	.card-container.small .title-box {
		padding-left: 95px;
	}
</style>
