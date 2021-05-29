<template>
	<view class="padding flex flex-direction">
		<navigator
			v-for="item in menuList"
			:key="item.title"
			:url="item.url"
			class="bg-white radius padding-sm margin-tb-sm shadow-lg"
			hover-class="default-hover"
		>
			<text>{{ item.title }}</text>
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
					title: '多选项卡',
					url: '/pages/multiple-tabs/multiple-tabs'
				}
			]
		};
	},
};
</script>

<style></style>
