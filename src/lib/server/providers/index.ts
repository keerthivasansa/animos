import Consumet from './consumet';

const providers = { consumet: Consumet };

export type AvailableProvider = keyof typeof providers;

export default providers;
