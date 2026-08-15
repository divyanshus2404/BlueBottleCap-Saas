"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
import { BLOG_POSTS, CATEGORY_GRADIENTS, type BlogPost } from "@/src/data/blogPosts";

const CATEGORIES = ["all", "JEE", "NEET", "Study Tips", "Strategy"] as const;

const CATEGORY_COLORS: Record<string, string> = {
  JEE: "bg-blue-100 text-blue-700",
  NEET: "bg-green-100 text-green-700",
  "Study Tips": "bg-purple-100 text-purple-700",
  Strategy: "bg-amber-100 text-amber-700",
};

function HeroBanner({ post, height = "h-[140px]" }: { post: BlogPost; height?: string }) {
  const grad = CATEGORY_GRADIENTS[post.category];
  const gradient = post.heroGradient || grad?.gradient || "from-gray-600 to-gray-800";
  const emoji = post.heroEmoji || grad?.emoji || "📝";
  const [gifFailed, setGifFailed] = React.useState(false);

  if (post.heroGif && !gifFailed) {
    return (
      <div className={`${height} relative overflow-hidden`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        <img
          src={post.heroGif.url}
          alt={post.heroGif.alt}
          className="relative h-full w-full object-cover mix-blend-luminosity opacity-60 transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={() => setGifFailed(true)}
        />
        <div className="absolute bottom-3 right-3 text-[32px] drop-shadow-lg">{emoji}</div>
      </div>
    );
  }

  return (
    <div className={`${height} relative overflow-hidden bg-gradient-to-br ${gradient} flex items-center justify-center`}>
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
      <span className="text-[48px] drop-shadow-lg">{emoji}</span>
    </div>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] transition hover:border-[var(--color-blue-ink)] hover:shadow-lg"
    >
      <HeroBanner post={post} height="h-[140px]" />
      <div className="p-6">
      <div className="flex items-center gap-2 text-[12px]">
        <span className={`rounded-full px-2.5 py-0.5 font-semibold ${CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-600"}`}>
          {post.category}
        </span>
        <span className="flex items-center gap-1 text-[var(--color-ink-faint)]">
          <Clock className="h-3 w-3" /> {post.readTime} min read
        </span>
        <span className="text-[var(--color-ink-faint)]">{new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
      </div>
      <h2 className="mt-3 text-[18px] font-bold leading-snug text-[var(--color-ink)] group-hover:text-[var(--color-blue-ink)] transition-colors">
        {post.title}
      </h2>
      <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-ink-soft)]">
        {post.description}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {post.tags.map((tag) => (
          <span key={tag} className="rounded-md bg-[var(--color-paper)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-ink-faint)]">
            {tag}
          </span>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-1 text-[13px] font-semibold text-[var(--color-blue-ink)] opacity-0 group-hover:opacity-100 transition-opacity">
        Read article <ArrowRight className="h-3.5 w-3.5" />
      </p>
      </div>
    </Link>
  );
}

export function BlogList() {
  const [category, setCategory] = useState<string>("all");

  const filtered = category === "all" ? BLOG_POSTS : BLOG_POSTS.filter((p) => p.category === category);

  return (
    <div className="bbc mx-auto max-w-[820px] px-7 py-12">
      <p className="bbc-eyebrow">Blog</p>
      <h1 className="bbc-serif mt-3 text-[clamp(28px,4vw,42px)] leading-[1.08] tracking-[-.02em]">
        Study tips & exam strategy
      </h1>
      <p className="mt-3 max-w-[50ch] text-[15px] text-[var(--color-ink-soft)]">
        Expert guides to help you study smarter, not harder. Written for JEE & NEET aspirants.
      </p>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition ${
              category === cat
                ? "bg-[var(--color-blue-ink)] text-white"
                : "border border-[var(--color-line)] text-[var(--color-ink-soft)] hover:border-[var(--color-blue-ink)]"
            }`}
          >
            {cat === "all" ? "All Posts" : cat}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-5">
        {filtered.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-[var(--color-ink-faint)]" />
          <p className="mt-3 text-[15px] text-[var(--color-ink-soft)]">No posts in this category yet.</p>
        </div>
      )}
    </div>
  );
}
