<template>
	<view class="content">
		<scroll-view scroll-x>

			<baizc-virtual-list direction="horizontal" ref="virtualList" :dataSources="dataSources">
				<template v-slot:default="{item}">

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

				</template>
			</baizc-virtual-list>

		</scroll-view>
	</view>
</template>

<script>
	// import virtualListMixin from '@/uni_modules/baizc-virtual-list/mixins/virtual-list.js';

	import {
		getMockNews
	} from '@/common/mock.js';

	export default {
		mixins: [],
		data() {
			return {
				dataSources: []
			};
		},
		onLoad: function() {
			getMockNews(100).then(res => {
				this.dataSources.push(...res);
			});
		}
	};
</script>

<style></style>
