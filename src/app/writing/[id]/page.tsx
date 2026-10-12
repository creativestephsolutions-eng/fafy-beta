import { notFound } from "next/navigation";
import PostView from "./PostView";

export const metadata = {
  title: "You're Welcome · The Writing · FAFY",
};

export default function WritingPostPage({ params }: { params: { id: string } }) {
  if (params.id !== "youre-welcome") notFound();
  return <PostView />;
}
