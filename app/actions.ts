"use server";

import { ApplicationError } from "@/lib/error";
import { supabaseClient } from "@/lib/supabase";
import OpenAI from "openai";
import { decode } from "base64-arraybuffer";
import { SDXL } from "segmind-npm";

const apiKey = process.env.NEXT_PUBLIC_SIGMIND_API_KEY;
const openAiKey = process.env.OPENAI_KEY;
const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL;

export async function createCompletion(prompt: string): Promise<any> {
  if (!prompt) {
    throw new Error("Prompt is missing");
  }

  if (!openAiKey) {
    throw new ApplicationError("Missing environment variable OPENAI_KEY");
  }
  if (!projectId) {
    throw new ApplicationError("Database URL is missing");
  }
  if (!apiKey) {
    throw new ApplicationError("Segmind api key missing");
  }

  const openai = new OpenAI({ apiKey: openAiKey });
  const sdxl = new SDXL(apiKey);

  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: "Say this is a test" }],
    model: "gpt-3.5-turbo",
  });

  const blogContent = chatCompletion.choices[0].message?.content;

  const sigmindResponse = await sdxl.generate({
    prompt: prompt,
    style: "base",
    samples: 1,
    scheduler: "UniPC",
    num_inference_steps: 25,
    guidance_scale: 8,
    strength: 0.2,
    high_noise_fraction: 0.8,
    seed: 468685,
    img_width: 1024,
    img_height: 1024,
    refiner: true,
    base64: true,
  });
  const imageBuffer = sigmindResponse.data;
  if (!imageBuffer) {
    throw new ApplicationError("Error generating image");
  }

  const timestamp = new Date().toISOString().replace(/[^0-9]/g, "");
  const filePath = `blog2_${timestamp}`;

  const { data, error } = await supabaseClient.storage
    .from("images")
    .upload(filePath, decode(imageBuffer.image), {
      contentType: "image/jpeg",
    });

  if (error) {
    throw new ApplicationError("Unable to upload image");
  }

  const path = data.path;
  const imageUrl = `${projectId}.supabase.co/storage/v1/object/public/images/${path}`;

  const { data: blogData, error: blogError } = await supabaseClient
    .from("blogs")
    .insert([
      {
        title: prompt,
        content: blogContent,
        imageUrl: imageUrl,
        userId: "123",
      },
    ])
    .select();

  if (blogError) {
    throw new Error("Failed to create blog post");
  }

  return { ...blogData, imageBuffer };
}
