const axios = require("axios");
const { load } = require('cheerio');

const zoroBase = "https://zoro.to";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36";
const headerOption = { headers: { "User-Agent": USER_AGENT, "X-Requested-With": "XMLHttpRequest" } };

const fetchSearchZoro = async ({ list = [], keyw, page = 1 }) => {
    try {
        if (!keyw) return {
            error: true,
            error_message: "No keyword provided"
        };

        const res = await axios.get(zoroBase + `/search?keyword=${keyw}&page=${page}`);
        const $ = load(res.data);

        $('div.film_list-wrap > div.flw-item').each((i, el) => {
            list.push({
                animeTitle: $(el).find('div.film-detail > .film-name > a').text(),
                animeId: $(el).find('div.film-detail > .film-name > a').attr('href').split('/')[1].split('?')[0],
                animeImg: $(el).find('div.film-poster > img').attr('data-src')
            })
        })

        return list;
    } catch (err) {
        return {
            error: true,
            error_message: err
        }
    }
}

module.exports = { fetchSearchZoro }