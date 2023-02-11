import { SUPABASE_SERVICE_ROLE } from "$env/static/private";
import { SupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./utils";


export const supabase = new SupabaseClient(supabaseUrl, SUPABASE_SERVICE_ROLE);