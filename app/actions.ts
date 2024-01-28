"use server";

import { ApplicationError } from "@/lib/error";
import { supabaseClient } from "@/lib/supabase";
import OpenAI from "openai";
import { decode } from "base64-arraybuffer";
import { RealisticVision } from "segmind-npm";
import { redirect } from "next/navigation";

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
  const sdxl = new RealisticVision(apiKey);

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant. Your task is to create a well-researched, SEO-optimized blog post in markdown format.",
      },
      {
        role: "user",
        content: "Please ensure the title is SEO-friendly.",
      },
      {
        role: "system",
        content: "Understood. The title will be crafted to be SEO-friendly.",
      },
      {
        role: "user",
        content:
          "The response should be a JSON object with keys for title, content, and tags.",
      },
      {
        role: "system",
        content: "The response will be provided in the specified JSON format.",
      },
      {
        role: "user",
        content:
          "The content should also be SEO-friendly and formatted in markdown.",
      },
      {
        role: "system",
        content: "The content will be SEO-friendly and formatted in markdown.",
      },
      {
        role: "user",
        content:
          "Lastly, I need the tags to be an array of strings relevant to the content of the title.",
      },
      {
        role: "system",
        content:
          "The tags will be an array of strings relevant to the content of the title.",
      },
    ],
    model: "gpt-3.5-turbo",
    response_format: { type: "json_object" },
  });

  const blogContent = chatCompletion.choices[0].message?.content;

  const segmindResponse = await sdxl.generate({
    prompt: prompt,
    negativePrompt:
      "ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, extra limbs, disfigured, deformed, body out of frame, blurry, bad anatomy, blurred, watermark, grainy, signature, cut off, draft, (deformed, distorted, disfigured:1.3), poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, (mutated hands and fingers:1.4), disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation, render, 3d, 2d, sketch, painting, digital art, drawing, disfigured, ((nsfw)), ((breasts))",
    scheduler: "dpmpp_2m",
    num_inference_steps: 25,
    guidance_scale: 6,
    samples: 1,
    seed: 4082622942,
    img_width: 512,
    img_height: 768,
    base64: true,
  });

  const imageBuffer = segmindResponse.data;
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
  const imageUrl = `${projectId}/storage/v1/object/public/images/${path}`;

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
  const blogId = blogData[0].id;
  redirect(`/blog/${blogId}`);
}
