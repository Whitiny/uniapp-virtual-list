<template>
	<view class="padding flex flex-direction">
		<view class="flex justify-center">
			<image style="width: 100px;" src="../../static/extui.png" mode="widthFix"></image>
		</view>
		<view class="padding-tb">
			
		</view>
		<navigator
			v-for="item in menuList"
			:key="item.title"
			:url="item.url"
			class="bg-white radius padding-sm margin-tb-sm shadow-lg flex align-center justify-between"
			hover-class="default-hover"
		>
			<view>{{ item.title }}</view>
			<view class="cuIcon-right"></view>
		</navigator>
	</view>
</template>

<script>
export default {
	data() {
		return {
			menuList: [
				{
					title: '固定高度',
					url: '/pages/fixed-size/fixed-size'
				},
				{
					title: '动态高度',
					url: '/pages/dynamic-size/dynamic-size'
				},
				{
					title: '横向列表',
					url: '/pages/horizontal/horizontal'
				},
				{
					title: '多选项卡',
					url: '/pages/multiple-tabs/multiple-tabs'
				}
			]
		};
	},
};
</script>

<style></style>
