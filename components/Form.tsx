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
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

const Form = () => {
  async function action(formData: FormData) {
    const prompt = formData.get("topic");
    if (!prompt) {
      toast.error("Please enter a topic name.");
      return;
    }
    try {
      const result = await createCompletion(prompt as string);
    } catch (error) {
      toast.error(
        "An error occurred while processing your request. Please try again."
      );
      console.error("Error", error);
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
            <FormButton />
          </CardFooter>
        </form>
      </Card>
    </section>
  );
};

export default Form;

const FormButton = () => {
  const { pending } = useFormStatus();
  return (
    <Button
      className={cn("w-full", pending && "animate-pulse")}
      type="submit"
      disabled={pending}
    >
      {pending ? "Generating..." : "Generate Blog Post"}
    </Button>
  );
};
