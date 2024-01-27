import axios, { AxiosError } from "axios";

interface SigmindResponse {
  data: any;
  status: number;
  statusText: string;
}

interface SigmindRequestProps {
  prompt: string;
  negative_prompt?: string;
  style?: string;
  samples?: number;
  scheduler?: string;
  num_inference_steps?: number;
  guidance_scale?: number;
  strength?: number;
  high_noise_fraction?: number;
  seed?: number;
  img_width?: number;
  img_height?: number;
  refiner?: boolean;
  base64?: boolean;
}

const callSigmindAPI = async (props: Partial<SigmindRequestProps> & { prompt: string }): Promise<SigmindResponse> => {
  const {
    prompt,
    negative_prompt = "",
    style = "base",
    samples = 1,
    scheduler = "UniPC",
    num_inference_steps = 25,
    guidance_scale = 8,
    strength = 0.2,
    high_noise_fraction = 0.8,
    seed = 468685,
    img_width = 1024,
    img_height = 1024,
    refiner = true,
    base64 = false,
  } = props;

  const api_key = process.env.NEXT_PUBLIC_SIGMIND_API_KEY;
  const url = "https://api.segmind.com/v1/sdxl1.0-txt2img";
  
  if (!api_key) {
    throw new Error("Api key is missing");
  }

  const data = {
    prompt,
    negative_prompt,
    style,
    samples,
    scheduler,
    num_inference_steps,
    guidance_scale,
    strength,
    high_noise_fraction,
    seed,
    img_width,
    img_height,
    refiner,
    base64,
  };

  try {
    const response = await axios.post(url, data, {
      headers: { "x-api-key": api_key },
    });

    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("Error:", axiosError.message);
    throw axiosError; // Rethrowing the error for caller to handle
  }
};

export { callSigmindAPI };
