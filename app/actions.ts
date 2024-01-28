"use server";

import { ApplicationError } from "@/lib/error";
import { supabaseClient } from "@/lib/supabase";
import OpenAI from "openai";
import { decode } from "base64-arraybuffer";
import { SDXL } from "segmind-npm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const apiKey = process.env.NEXT_PUBLIC_SIGMIND_API_KEY;
const openAiKey = process.env.OPENAI_KEY;
const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL;

function validateInputs(prompt: string): void {
  if (!prompt) {
    throw new Error("Prompt is missing");
  }

  if (!openAiKey || !projectId || !apiKey) {
    throw new ApplicationError("One or more environment variables are missing");
  }
}

async function createOpenAICompletion(prompt: string): Promise<string> {
  const openai = new OpenAI({ apiKey: openAiKey });

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that's going to create a well-researched and SEO-optimized blog post.",
      },
      { role: "user", content: prompt },
    ],
    model: "gpt-3.5-turbo",
  });

  return chatCompletion.choices[0].message?.content || "";
}

async function generateSigmindImage(prompt: string): Promise<any> {
  const sdxl = new SDXL(apiKey);

  const sigmindResponse = await sdxl.generate({
    prompt,
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

  if (!sigmindResponse.data) {
    console.log(sigmindResponse);
    throw new ApplicationError("Error generating image");
  }

  return sigmindResponse.data;
}

async function uploadImageToSupabase(imageBuffer: any): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, "");
  const filePath = `blog2_${timestamp}`;

  const { data, error } = await supabaseClient.storage
    .from("images")
    .upload(filePath, decode(imageBuffer.image), {
      contentType: "image/jpeg",
    });

  if (error) {
    console.log(error);
    throw new ApplicationError("Unable to upload image");
  }

  return data.path;
}

async function createBlogPostInSupabase(
  prompt: string,
  blogContent: string,
  imagePath: string
): Promise<number> {
  const imageUrl = `${projectId}/storage/v1/object/public/images/${imagePath}`;

  const { data, error } = await supabaseClient
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

  if (error) {
    throw new Error("Failed to create blog post");
  }

  return data[0].id;
}

export const config = {
  runtime: "edge",
};

export async function createCompletion(prompt: string): Promise<void> {
  try {
    validateInputs(prompt);

    const blogContent = await createOpenAICompletion(prompt);
    const imageBuffer = await generateSigmindImage(prompt);
    const imagePath = await uploadImageToSupabase(imageBuffer);
    const blogId = await createBlogPostInSupabase(
      prompt,
      blogContent,
      imagePath
    );
    revalidatePath("/");
    redirect(`/blog/${blogId}`);
  } catch (error) {
    // Handle or log error
    console.error(error);
    throw error;
  }
}
