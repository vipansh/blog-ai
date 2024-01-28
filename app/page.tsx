import AllBlogsCard from "@/components/AllBlogsCard";
import Form from "@/components/Form";
import Image from "next/image";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-2">
      <Form />
      <div>
        <AllBlogsCard />
      </div>
    </main>
  );
}
