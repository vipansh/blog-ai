const openAiKey = process.env.OPENAI_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

import { createClient } from "@supabase/supabase-js";

// Ensure environment variables are defined
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase URL and Service Key must be defined");
}

export const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

export const getBlogById = async (id: number) => {
  const blog = await supabaseClient
    .from("blogs")
    .select()
    .eq("id", id)
    .single();
  return blog;
};

export const getAllBlogs = async () => {
  const allBlogs = await supabaseClient
    .from("blogs")
    .select()
    .order("created_at", { ascending: false });
  return allBlogs;
};
