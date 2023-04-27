import type { AxiosResponse } from 'axios';
import type { CheerioAPI } from 'cheerio';
import CryptoJS from 'crypto-js';

const key = CryptoJS.enc.Utf8.parse('37911490979715163134003223491201');
const second_key = CryptoJS.enc.Utf8.parse('54674138327930866480207815084989');
const iv = CryptoJS.enc.Utf8.parse('3134003223491201');

export const getAjaxParams = async ($: CheerioAPI, id: string) => {
	const encryptedKey = CryptoJS.AES['encrypt'](id, key, { iv: iv });
	const script = $("script[data-name='episode']").data().value as string;
	const token = CryptoJS.AES['decrypt'](script, key, { iv: iv }).toString(CryptoJS.enc.Utf8);
	return `id=${encryptedKey}&alias=${id}&${token}`;
};

type GogoSource = {
	source: { file: string; label: string }[];
	source_bk: { file: string; label: string }[];
};

export const decryptAjaxResponse = async (fetchedRes: AxiosResponse): Promise<GogoSource> => {
	const decryptedString = CryptoJS.enc.Utf8.stringify(
		CryptoJS.AES.decrypt(fetchedRes.data, second_key, { iv: iv })
	);

	return JSON.parse(decryptedString);
};
