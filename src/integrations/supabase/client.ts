
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://isjcanepamlbwrxujuvz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzamNhbmVwYW1sYndyeHVqdXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwNjMyMDQsImV4cCI6MjA1ODYzOTIwNH0.ue75CyIzjYJ6WZW7mMImLiGij0KW0JpU5FrDXubpusc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
