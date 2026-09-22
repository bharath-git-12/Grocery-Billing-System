const SUPABASE_URL = "https://epjrkvpjzpaqzvwkqtmd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_5gqQcZPKDCZ53Z_JwVp1PA_1fqXVeBz";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

console.log("Supabase connected successfully!");