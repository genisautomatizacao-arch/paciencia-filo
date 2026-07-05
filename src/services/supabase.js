// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = 'https://hebmxnrelpyvmkmymxmf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlYm14bnJlbHB5dm1rbXlteG1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MTgyMzUsImV4cCI6MjA5MTQ5NDIzNX0.DQwIbZeQucvItNJ8NRyUalPLuHVPIIy5oYzFxCgTM-E';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Nome do bucket no Supabase Storage onde ficam as imagens de fundo
export const BACKGROUNDS_BUCKET = 'promise-backgrounds';
