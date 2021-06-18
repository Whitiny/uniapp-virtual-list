<template>
	<view class="content">
		<scroll-view scroll-x>

			<baizc-virtual-list direction="horizontal" ref="virtualList" :uniqueIds="uniqueIds" @change="onRangeChange">
				<view class="flex" :style="{padding: vRange.padStyle}">
					<virtual-list-item v-for="item in visibleList" :uid="item.id" :key="item.id" @size="onEmitSize">
					
						<view style="padding: 7px; width: 120px;">
							<view class="bg-white flex flex-direction align-center padding-tb-sm"
								style="border-radius: 6px;">
								<image :src="item.image" mode="aspectFill" class="radius"
									style="width: 82px; height: 100px; flex: none;"></image>
								<view class="margin-top-xs" style="">
									{{ item.no }}
								</view>
							</view>
						</view>
					
					</virtual-list-item>
				</view>
			</baizc-virtual-list>

		</scroll-view>
	</view>
</template>

<script>
	import virtualListMixin from '@/uni_modules/baizc-virtual-list/mixins/virtual-list.js';

	import {
		getMockNews
	} from '@/common/mock.js';

	export default {
		mixins: [
			virtualListMixin
		],
		data() {
			return {
				dataSources: []
			};
		},
		onLoad: function() {
			getMockNews(5000).then(res => {
				this.dataSources.push(...res);
			});
		}
	};
</script>

<style></style>
