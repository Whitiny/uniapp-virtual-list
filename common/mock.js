import genUid from './gen-unique-id.js';
import news from './news.js';

const getMockNews = function(num = 20) {
	let rand,
		max = news.length,
		result = new Array(num).fill('').map( () => {
			rand = Math.round(Math.random() * max);
			return {
				...news[rand],
				id: genUid()
			}
		});
		
	return result;
}

export {
	getMockNews as default
}