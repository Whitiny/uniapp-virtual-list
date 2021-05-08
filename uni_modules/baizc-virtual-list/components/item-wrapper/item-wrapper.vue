<template>
	<div :id="uid">
		<slot></slot>
	</div>
</template>

<script>
	export default {
		props: {
			uid: {
				type: [Number, String],
				default: 'uid'
			},
		},
		mounted:function(){
			// this.$parent.$emit()
			// console.log(this.uid, 'item-wrapper mounted');
			// this.$nextTick(() => {
			// 	console.log(this.uid, 'item-wrapper nextTick mounted');
			// })
			
			let query = uni.createSelectorQuery().in(this);
			query.select(`#${this.uid}`).fields({size: true}, (res) => {
				console.log(this.uid, res);
			}).exec();
		},
		updated:function(){
			console.log('updated', this)
		}
	}
</script>

<style>
</style>
