import {_ref} from '@/uni_modules/baizc-virtual-list/libs/util.js';

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
			return this.dataSources.map(item => item.id);
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
			let vsl = _ref(this.$refs, `virtualList${this.i}`);
			if (vsl) vsl.saveSize(data);
		}
	}
}
