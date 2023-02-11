import env from "$lib/env";
import { SupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./utils";


export const supabase = new SupabaseClient(supabaseUrl, env.SUPABASE_SERVICE_ROLE);