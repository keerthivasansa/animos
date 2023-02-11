import env from "$lib/env";
import supabasePkg from "@supabase/supabase-js";
import { supabaseUrl } from "./utils";

export const supabase = new supabasePkg.SupabaseClient(supabaseUrl, env.SUPABASE_SERVICE_ROLE);