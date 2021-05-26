<template>
	<view style="padding: 7px 30rpx;">
		<view class="bg-white solid-bottom padding" style="border-radius: 6px;">
			<view class="" style="display: flex; flex-direction: column;">
				<view class="text-cut-2" style="margin-bottom: 5px; font-size: 32rpx; font-weight: bold;">
					{{no}}、{{title}}
				</view>
			</view>
			<view class="flex align-center flex-between">
				<image :src="image" mode="" class="margin-right-sm" style="width: 70px; height: 65px; flex: 1;"></image>
				<image :src="image" mode="aspectFill" class="margin-right-sm"
					style="width: 70px; height: 65px; flex: 1;"></image>
				<image :src="image" mode="aspectFill" class="" style="width: 70px; height: 65px; flex: 1;"></image>
			</view>
			<view class="margin-top-xs">{{passtime}}</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "news-item-pic3",
		props: {
			image: String,
			no: [Number, String],
			title: String,
			passtime: String
		},
		data() {
			return {

			};
		}
	}
</script>

<style>

</style>
