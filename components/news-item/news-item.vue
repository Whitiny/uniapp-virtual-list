<template>
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

<script>
	export default {
		name: "news-item",
		props: {
			item: {
				type: Object,
				default: (() => {})
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
