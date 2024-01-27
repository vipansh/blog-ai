"use server";

import { ApplicationError } from "@/lib/error";
import { callSigmindAPI } from "@/lib/sigmind";
import { supabaseClient } from "@/lib/supabase";
import OpenAI from "openai";
import { decode } from "base64-arraybuffer";

const openAiKey = process.env.OPENAI_KEY;
const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL;

export async function createCompletion(prompt: string): Promise<any> {
  if (!prompt) {
    console.log("Prompt is missing");
    throw new Error("Prompt is missing");
  }

  if (!openAiKey) {
    console.log("Missing environment variable OPENAI_KEY");
    throw new ApplicationError("Missing environment variable OPENAI_KEY");
  }
  if (!projectId) {
    console.log("Database URL is missing");
    throw new ApplicationError("Database URL is missing");
  }

  console.log("Creating a new OpenAI instance");
  const openai = new OpenAI({ apiKey: openAiKey });

  // Generate blog post using OpenAI
  console.log("Generating blog post using OpenAI");
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: "Say this is a test" }],
    model: "gpt-3.5-turbo",
  });

  const blogContent = chatCompletion.choices[0].message?.content;
  console.log("Blog post generated");

  // Generate an image using Sigmind
  console.log("Generating an image using Sigmind");
  const sigmindResponse = await callSigmindAPI({ prompt });
  const imageBuffer = sigmindResponse.data;
  if (!imageBuffer) {
    console.log("Error generating image");
    throw new ApplicationError("Error generating image");
  }
  console.log("Image generated");

  // Upload the image to Supabase storage
  console.log("Uploading the image to Supabase storage");
  const { data, error } = await supabaseClient.storage
    .from("images")
    .upload(`blog-${Date.now()}`, decode(imageBuffer), {
      contentType: "image/png",
    });

  if (error) {
    console.log("Unable to upload image", error);
    throw new ApplicationError("Unable to upload image");
  }
  console.log("Image uploaded");

  const path = data.path;
  const imageUrl = `${projectId}.supabase.co/storage/v1/object/public/images/${path}`;

  // Create a new blog post in Supabase on blog table passing title, content, image_url, and userId
  console.log("Creating a new blog post in Supabase");
  const { data: blogData, error: blogError } = await supabaseClient
    .from("blog")
    .insert([
      {
        title: prompt,
        content: blogContent,
        image_url: imageUrl,
        user_id: "123",
      },
    ])
    .select();

  if (blogError) {
    console.log("Failed to create blog post", blogError);
    throw new Error("Failed to create blog post");
  }
  console.log("Blog post created successfully");

  return blogData;
}
