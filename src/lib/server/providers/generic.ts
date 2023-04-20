import { MalSync } from "@server/helpers/malsync"

export type ProviderName = "Gogoanime" | "animepahe" | "default"

abstract class Provider {
    public provider: ProviderName = "default"
    public malId: number;

    constructor(malId: number) {
        this.malId = malId;
    }

    async getProviderId() {
        if (this.provider === "default")
            throw new Error("Default provider has been called.")
        const id = await MalSync.getProviderId(this.malId, this.provider);
        return id;
    }

    abstract getSource(): Promise<string>
}

export default Provider;