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

const BlogPage = async ({ params: { id } }: Props) => {
  const {
    data: { content, imageUrl },
  } = await getBlogById(Number(id));
  console.log({ content, imageUrl });

  return (
    <section className="mx-auto max-w-xl p-4 py-12">
      <Link href="/">Home</Link>
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
