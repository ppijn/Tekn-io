require("dotenv").config();

// import { createClient } from "@supabase/supabase-js";
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://ibfohflrkoufvcnxpafq.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
