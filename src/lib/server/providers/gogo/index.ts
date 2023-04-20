import Provider, { type ProviderName } from "../generic";

class GogoProvider extends Provider {
    provider: ProviderName = "Gogoanime";

    async getSource() {
        const gogoSlug = await this.getProviderId();
        // scrape.
        console.log(gogoSlug);
        return ""
    };
}

export default GogoProvider;