"use client";

import { createCompletion } from "@/app/actions";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";

const Form = () => {
  async function action(formData: FormData) {
    const prompt = formData.get("topic");
    //     if (!prompt) {
    //       toast.error("Please enter a topic name.");
    //       return;
    //     }
    try {
      const result = await createCompletion(prompt as string);
      if (result.error) {
        toast.error(result.error);
      }
      console.log({ result });
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  return (
    <section className="mx-auto max-w-lg">
      <Card className="border-0 shadow-none">
        <CardHeader className="text-center">
          <CardTitle>AI Blog Post Generator</CardTitle>
          <CardDescription>
            Generate a unique and engaging blog post in seconds
          </CardDescription>
        </CardHeader>
        <form action={action}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="topic">Enter your desired blog topic</Label>
                <Input
                  name="topic"
                  id="topic"
                  placeholder="Type the blog topic here"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button className="w-full" type="submit">
              Generate Blog Post
            </Button>
          </CardFooter>
        </form>
      </Card>
    </section>
  );
};

export default Form;