import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rhjigiurhxqndqrfeoql.supabase.co';
// This key is safe to expose in a browser environment.
// It allows anonymous access based on your Row Level Security policies.
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoamlnaXVyaHhxbmRxcmZlb3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NDg4MjYsImV4cCI6MjA4NTUyNDgyNn0.m9CWY1cw-YF6b9hIDeYcB4Y2EAbNl5d2XPw0eeUwoJo';

// ISO-9001 Compliance: Explicitly set the schema to 'appQAQC' for all database operations.
// This ensures the application interacts with the correct, isolated data schema.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'appQAQC',
  },
});