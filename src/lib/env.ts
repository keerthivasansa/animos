import { z } from "zod"

const envSchema = z.object({
    SUPABASE_SERVICE_ROLE: z.string(),
    JWT_SECRET: z.string(),
})

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    throw new Error(JSON.stringify(parsed.error.format(), null, 3))
}

export default parsed.data;