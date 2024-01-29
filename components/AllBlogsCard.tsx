import { useEffect, useState } from "react";
import { getAllBlogs, supabaseClient } from "@/lib/supabase";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import Image from "next/image";
import { formetDate } from "@/lib/utils";

type Props = {};

export const runtime = "edge";

const AllBlogsCard = async (props: Props) => {
  const { data, error } = await getAllBlogs();

  //   console.log({ data, error });
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data?.map((blog) => (
        <Card key={blog.id}>
          <CardContent>
            <Link href={`/blog/${blog.id}`} passHref>
              <Image
                alt={blog.title}
                src={blog.imageUrl}
                width={200}
                height={200}
                layout="responsive"
              />
              <div>
                <h4 className="font-medium">{blog.title}</h4>
                <p>{formetDate(blog.created_at)}</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AllBlogsCard;
