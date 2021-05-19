import genUid from './gen-unique-id.js';
import news from './news.js';

const getMockNews = function(num = 20, count = 1) {
	let i,
		rand,
		max = news.length - 1,
		result = new Array(num).fill('').map( () => {
			rand = Math.random();
			i = Math.round(Math.random() * max);
			return {
				...news[i],
				id: genUid(),
				no: count++,
				type: 1 > 0.5? 'small' : 'medium'
			}
		});
		
	return result;
}

export {
	getMockNews
}