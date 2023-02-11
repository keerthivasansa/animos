import { SUPABASE_SERVICE_ROLE } from "$env/static/private";
import supabasePkg from "@supabase/supabase-js";
import { supabaseUrl } from "./utils";

export const supabase = new supabasePkg.SupabaseClient(supabaseUrl, SUPABASE_SERVICE_ROLE);