import Back from "@/components/svg/Back";
import { getBlogById } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Markdown from "react-markdown";

type Props = {
  params: {
    id: string;
  };
};

export const runtime = "edge";

const BlogPage = async ({ params: { id } }: Props) => {
  const {
    data: { content, imageUrl },
  } = await getBlogById(Number(id));
  console.log({ content, imageUrl });

  return (
    <section className="mx-auto max-w-xl p-4 py-12">
      <nav className="my-4">
        <Link href="/">
          <div className="flex items-center space-x-2">
            <Back />
            <p>Back</p>
          </div>
        </Link>
      </nav>{" "}
      <Image
        alt=""
        src={imageUrl}
        width={800}
        height={300}
        layout="responsive"
      />
      <article className="prose">
        <Markdown>{content}</Markdown>
      </article>
    </section>
  );
};

export default BlogPage;
