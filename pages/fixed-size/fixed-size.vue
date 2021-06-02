<template>
	<view class="content">
		<mescroll-body ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="upCallback">
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
		</mescroll-body>
	</view>
</template>

<script>
	import mescrollUni from '@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-uni.vue';

	// import virtualListMixin from '@/uni_modules/baizc-virtual-list/mixins/virtual-list.js';
	import mescrollMixin from '@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js';

	import {
		getMockNews
	} from '@/common/mock.js';

	export default {
		components: {
			mescrollUni
		},
		mixins: [mescrollMixin],
		data() {
			return {
				dataSources: []
			};
		},
		onLoad: function() {
			this.getData();
		},
		methods: {
			getData: async function() {
				try{
					let res = await getMockNews(10000);
					this.dataSources.push(...res)
					this.mescroll.endSuccess(res.length, false)
				}catch(e){
					this.mescroll.endErr();
				}
			}
		},
	};
</script>

<style></style>
