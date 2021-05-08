export  default class Virtual {
	constructor(param) {
	    this.init(param)
	}
	
	init(param) {
		this.para = param;
		
		this.size = new Map();
	}
}