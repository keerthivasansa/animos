import NineAnime from './consumet/9anime';
import GogoProvider from './gogo';

const providers = { gogo: GogoProvider, '9anime': NineAnime };

export type AvailableProvider = keyof typeof providers;

export default providers;
