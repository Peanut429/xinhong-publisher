import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <nav className="flex gap-4 p-4 justify-center items-center h-screen">
      <Link href="/generate-article" className="cursor-pointer">
        <Button>Generate Article</Button>
      </Link>
      <Link href="/import-data" className="cursor-pointer">
        <Button>Import Data</Button>
      </Link>
      <Link href="/write" className="cursor-pointer">
        <Button>Write</Button>
      </Link>
    </nav>
  );
}
