<template>
	<view class="item" class="flex align-center" style="padding: 24rpx 30rpx;">
		<image :src="item.image" mode="aspectFill" class="margin-right-sm" style="width: 40px; height: 40px; flex: none;"></image>
		<view class="" style="display: flex; flex-direction: column;">
			<view class="" style="margin-bottom: 5px; font-size: 32rpx; font-weight: bold;">{{item.title}}</view>
			<view class="">{{item.passtime}}</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			item: {
				type: Object,
				default: () => ({
					value: 1
				})
			}
		},
	}
</script>

<style>
</style>
