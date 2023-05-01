/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import axios from 'axios';

// Thanks to https://github.com/consumet/consumet.ts for the kwik extractor;

export const extractSource = async (kwikUrl) => {
	const axiosInstance = axios.create();
	console.log('Fetching source for', kwikUrl);

	try {
		const { data, config } = await axiosInstance.get(kwikUrl, {
			headers: {
				referer: 'https://animepahe.com/'
			}
		});
		console.log(config.proxy);
		const x = data.match(/p\}.*kwik.*/g);
		let y = x[0].split('return p}(')[1].split(',');

		const l = y.slice(0, y.length - 5).join('');
		y = y.slice(y.length - 5, -1);
		y.unshift(l);

		const [p, a, c, k, e, d] = y.map((x) => x.split('.sp')[0]);

		const formated = format(p, a, c, k, e, {});

		const source = formated
			.match(/source=\\(.*?)\\'/g)[0]
			.replace(/'/g, '')
			.replace(/source=/g, '')
			.replace(/\\/g, '');

		return source;
	} catch (err) {
		console.log('Failed to fetch kwik');
		console.error(err);
	}
};

function format(p, a, c, k, e, d) {
	k = k.split('|');
	e = (c) => {
		return (
			(c < a ? '' : e(parseInt((c / a).toString()))) +
			((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36))
		);
	};
	if (!''.replace(/^/, String)) {
		while (c--) {
			d[e(c)] = k[c] || e(c);
		}
		k = [
			(e) => {
				return d[e];
			}
		];
		e = () => {
			return '\\w+';
		};
		c = 1;
	}
	while (c--) {
		if (k[c]) {
			p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]);
		}
	}
	return p;
}
