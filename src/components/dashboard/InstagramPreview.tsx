"use client";

import Image from "next/image";

type Post = {
  id: string;
  caption: string;
  hashtags?: string | null;
  imageUrl?: string | null;
  status: string;
};

type Account = {
  username: string;
  displayName?: string | null;
  profilePicture?: string | null;
};

export function InstagramPreview({
  post,
  account,
}: {
  post: Post | null;
  account?: Account | null;
}) {
  if (!post) {
    return (
      <div className="flex h-full min-h-[480px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-slate-500">
        Prompt likho — post preview yahan dikhega
      </div>
    );
  }

  const tags = post.hashtags?.split(",").filter(Boolean) || [];
  const img = post.imageUrl || `https://picsum.photos/seed/${post.id}/1080/1080`;

  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
          {account?.profilePicture ? (
            <Image src={account.profilePicture} alt="" fill className="object-cover" unoptimized />
          ) : (
            <span className="flex h-full items-center justify-center text-xs font-bold">BD</span>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold">
            {account?.username || "bodana_digital"}
          </p>
          <p className="text-xs text-slate-500">Instagram Preview</p>
        </div>
      </div>

      {/* Image */}
      <div className="relative aspect-square w-full bg-slate-900">
        <Image src={img} alt="Post preview" fill className="object-cover" unoptimized />
      </div>

      {/* Actions */}
      <div className="flex gap-4 px-4 py-3 text-xl">
        <span>❤️</span>
        <span>💬</span>
        <span>📤</span>
        <span className="ml-auto">🔖</span>
      </div>

      {/* Caption */}
      <div className="px-4 pb-4">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          <span className="font-semibold">{account?.username || "bodana_digital"}</span>{" "}
          {post.caption}
        </p>
        {tags.length > 0 && (
          <p className="mt-2 text-sm text-blue-400">
            {tags.map((t) => `#${t.trim()}`).join(" ")}
          </p>
        )}
        <p className="mt-2 text-xs text-slate-500 uppercase">
          Status: {post.status}
        </p>
      </div>
    </div>
  );
}
