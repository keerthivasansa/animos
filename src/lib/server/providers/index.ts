import AnimePahe from './animepahe';
import NineAnime from './consumet/9anime';
import Zoro from './consumet/zoro';
import GogoProvider from './gogo';

const providers = { gogo: GogoProvider, '9anime': NineAnime, zoro: Zoro, animepahe: AnimePahe };

export type AvailableProvider = keyof typeof providers;

export default providers;
