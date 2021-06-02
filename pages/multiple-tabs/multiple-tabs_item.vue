<template>
	<!-- 
	swiper中的transfrom会使fixed失效,此时用height固定高度; 
	swiper中无法触发mescroll-mixins.js的onPageScroll和onReachBottom方法,只能用mescroll-uni,不能用mescroll-body
	-->
	<!-- ref动态生成: 字节跳动小程序编辑器不支持一个页面存在相同的ref (如不考虑字节跳动小程序可固定值为 ref="mescrollRef") -->
	<!-- top的高度等于悬浮菜单tabs的高度 -->
	<!-- #ifndef  MP-TOUTIAO || MP-ALIPAY -->
	<mescroll-uni :ref="'mescrollRef' + i" @init="mescrollInit" :height="height" :down="downOption" @down="downCallback"
		:up="upOption" @up="upCallback">
		<!-- #endif -->

		<!-- #ifdef  MP-TOUTIAO || MP-ALIPAY -->
		<scroll-view scroll-y :style="{height: height}" @scrolltolower="getData">
			<!-- #endif -->

			<!-- 数据列表 -->
			<baizc-virtual-list ref="virtualList" :dataSources="dataSources">
				<template v-slot:default="{item}">
					
					<view style="padding: 7px 30rpx;">
						<view class="bg-white flex align-center padding" style="border-radius: 6px;">
							<image :src="item.image" mode="aspectFill" class="margin-right-sm"
								style="width: 70px; height: 50px; flex: none;"></image>
							<view class="" style="display: flex; flex-direction: column;">
								<view class="text-cut-2"
									style="margin-bottom: 5px; font-size: 32rpx; font-weight: bold;">
									{{item.no}}、{{item.title}}
								</view>
								<view class="">{{item.passtime}}</view>
							</view>
						</view>
					</view>
					
				</template>
			</baizc-virtual-list>

			<!-- #ifdef  MP-TOUTIAO || MP-ALIPAY -->
			<view class="text-center padding-tb-xs" style="color: #808080;"><text class="cuIcon-loading cuIconfont-spin margin-right-xs"></text>
				加载中...</view>
		</scroll-view>
		<!-- #endif -->

		<!-- #ifndef  MP-TOUTIAO || MP-ALIPAY -->
	</mescroll-uni>
	<!-- #endif -->
</template>

<script>
	// import virtualListMixin from '@/uni_modules/baizc-virtual-list/mixins/virtual-list-swiper-item.js';

	import MescrollMixin from '@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js';

	import {
		getMockNews
	} from '@/common/mock.js';

	export default {
		mixins: [MescrollMixin],
		props: {
			i: Number, // 每个tab页的专属下标 (除了支付宝小程序必须在这里定义, 其他平台都可不用写, 因为已在MescrollMoreItemMixin定义)
			index: {
				// 当前tab的下标 (除了支付宝小程序必须在这里定义, 其他平台都可不用写, 因为已在MescrollMoreItemMixin定义)
				type: Number,
				default () {
					return 0;
				}
			},
			height: [Number, String] // mescroll的高度
		},
		data() {
			return {
				dataSources: [],
				// 头条小程序中 mescroll 组件出错，改用原生刷新加载
				page: {
					num: this.i * 20 + 1,
					size: 50
				},
				downOption: {
					auto: false // 不自动加载 (mixin已处理第一个tab触发downCallback)
				},
				upOption: {
					auto: false, // 不自动加载
					page: {
						num: this.i * 20, // 当前页码,默认0,回调之前会加1,即callback(page)会从1开始
						size: 50 // 每页数据的数量
					},
					noMoreSize: 4, //如果列表已无数据,可设置列表的总数量要大于半页才显示无更多数据;避免列表数据过少(比如只有一条数据),显示无更多数据会不好看; 默认5
					empty: {
						tip: '~ 空空如也 ~', // 提示
						btnText: '去看看'
					}
				}
			};
		},
		mounted: function() {
			if (this.i === 0) {
				// #ifdef MP-TOUTIAO || MP-ALIPAY
				this.refresh();
				this.isInit = true;
				// #endif
			} else {
				getMockNews(1000 * this.i).then(res => {
					this.dataSources.push(...res);
				})
			}
		},
		methods: {
			// 头条小程序中 mescroll 组件出错，改用原生刷新加载
			refresh: function() {
				this.page.num = 1;
				this.dataSources = [];
				return this.getData();

			},
			getData: function() {
				let {
					num,
					size
				} = this.page;

				return new Promise((resolve) => {
					getMockNews(size, (num - 1) * size + 1)
						.then(res => {
							this.dataSources.push(...res);
							this.page.num++;
							resolve();
						})
				})
			},
			/*上拉加载的回调: 其中page.num:当前页 从1开始, page.size:每页数据条数,默认10 */
			upCallback({
				num,
				size
			}) {
				getMockNews(size, (num - 1) * size + 1)
					.then(res => {
						if (num == 1) this.dataSources = [];
						this.dataSources.push(...res);
						this.mescroll.endSuccess(res.length, true);
					})
					.catch(err => {
						this.mescroll.endErr();
					});
			},

			// 以ref的方式初始化mescroll对象 (兼容字节跳动小程序)
			mescrollInitByRef() {
				if (!this.mescroll || !this.mescroll.resetUpScroll) {
					// 字节跳动小程序编辑器不支持一个页面存在相同的ref, 多mescroll的ref需动态生成, 格式为'mescrollRef下标'
					let mescrollRef = this.$refs.mescrollRef || this.$refs['mescrollRef' + this.i];
					if (mescrollRef) this.mescroll = mescrollRef.mescroll
				}
			},
			// mescroll组件初始化的回调,可获取到mescroll对象 (覆盖mescroll-mixins.js的mescrollInit, 为了标记isInit)
			mescrollInit(mescroll) {
				this.mescroll = mescroll;
				this.mescrollInitByRef && this.mescrollInitByRef(); // 兼容字节跳动小程序
				// 自动加载当前tab的数据
				if (this.i === this.index) {
					this.mescrollTrigger()
				}
			},
			// 主动触发加载
			mescrollTrigger() {
				this.isInit = true; // 标记为true
				if (this.mescroll) {
					if (this.mescroll.optDown.use) {
						this.mescroll.triggerDownScroll();
					} else {
						this.mescroll.triggerUpScroll();
					}
				}
			}
		}
	};
</script>
