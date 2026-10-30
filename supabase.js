
// Connect to Supabase

const SUPABASE_URL = "https://eatzezilioigaiojltvq.supabase.co";

const SUPABASE_KEY = "sb_publishable_RUrQhFR5msxgE5s6aflMfA_3CoeAV1K";

//logs out users when the page is closed
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
        auth: {
            persistSession: true,
            storage: window.sessionStorage,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    }
);

//keeps user logged in when the page is refreshed or closed
//const supabaseClient = window.supabase.createClient(
 //   SUPABASE_URL,
 //  SUPABASE_KEY
//);

