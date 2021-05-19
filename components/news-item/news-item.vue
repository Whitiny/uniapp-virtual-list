<template>
	<view class="flex align-center  solid-bottom" style="padding: 24rpx 30rpx;">
		<image :src="item.image" mode="aspectFill" class="margin-right-sm" style="width: 70px; height: 50px; flex: none;"></image>
		<view class="" style="display: flex; flex-direction: column;">
			<view class="" style="margin-bottom: 5px; font-size: 32rpx; font-weight: bold;">{{item.no}}、{{item.title}}</view>
			<view class="">{{item.passtime}}</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			item: {
				type: Object,
				default: () => ({})
			}
		},
		mounted:function(){
			// console.log(this.item['path'], 'slot mounted');
		},
		updated:function(){
			console.log('on news-item updated');
		}
	}
</script>

<style>
</style>
