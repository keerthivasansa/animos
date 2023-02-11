export const supabaseUrl = "https://nntnzjvjgjbtzkzwbmab.supabase.co";

export function getSourceUrl(episodeId: string) {
    return `${supabaseUrl}/storage/v1/object/public/sources/${episodeId}.m3u8`
}
