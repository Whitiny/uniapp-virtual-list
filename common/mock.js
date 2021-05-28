import genUid from './gen-unique-id.js';
import news from './news.js';

function getMockNews(num = 20, count = 1) {
	let i,
		max = news.length - 1,
		result = new Array(num).fill('').map( () => {

			i = Math.round(Math.random() * max);
			
			return {
				...news[i],
				id: genUid(),
				no: count++,
				type: Math.random() > 0.5? 'small' : 'medium'
			}
			
		});

	return result;
}

export {
	getMockNews
}