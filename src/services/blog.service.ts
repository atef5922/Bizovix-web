import { blogPosts } from "@/src/data/blog";
import { wait } from "@/src/lib/utils";

export async function fetchBlogPosts() {
  await wait(250);
  return { ok: true as const, data: blogPosts };
}
