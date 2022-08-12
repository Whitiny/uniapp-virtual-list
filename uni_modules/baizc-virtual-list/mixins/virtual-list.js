import {
	_ref
} from '@/uni_modules/baizc-virtual-list/libs/util.js';

export default {
	data() {
		return {
			dataSources: [],
			vRange: {
				start: 0,
				end: 0,
				padStyle: '',
				padFront: 0,
				padBehind: 0
			}
		}
	},
	computed: {
		uniqueIds() {
			return this.dataSources.map(item => item.uid);
		},
		visibleList() {
			return this.dataSources.slice(this.vRange.start, this.vRange.end + 1);
		}
	},
	methods: {
		onRangeChange: function(vRange) {
			Object.assign(this.vRange, vRange);
		},
		onEmitSize: function(data) {
			// 支付宝小程序中 模板上 ref 如果是嵌套的，$refs 获取到的结果也是嵌套的，需要自行递归去获取
			let vsl =  _ref(this.$refs, 'virtualList');
			if(vsl) vsl.saveSize(data);
		}
	}
}
