"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Share2 } from "lucide-react";
import { WhatsAppShare } from "./WhatsAppShare";
import { TOPIC_GIFS, CATEGORY_GRADIENTS, type BlogPost } from "@/src/data/blogPosts";
import { trackEvent } from "@/src/lib/analytics";

function renderMarkdown(content: string): React.ReactNode[] {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let tableHeader: string[] = [];
  let listItems: React.ReactNode[] = [];
  let inList = false;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(<ul key={`list-${elements.length}`} className="my-4 ml-5 space-y-1.5 list-disc text-[15px] text-[var(--color-ink-soft)]">{listItems}</ul>);
      listItems = [];
      inList = false;
    }
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      elements.push(
        <div key={`table-${elements.length}`} className="my-6 overflow-x-auto rounded-xl border border-[var(--color-line)]">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[var(--color-paper)]">
                {tableHeader.map((h, i) => <th key={i} className="px-4 py-2.5 text-left font-bold text-[var(--color-ink)]">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, ri) => (
                <tr key={ri} className="border-t border-[var(--color-line)]">
                  {row.map((cell, ci) => <td key={ci} className="px-4 py-2 text-[var(--color-ink-soft)]">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      tableHeader = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("|") && line.endsWith("|")) {
      const cells = line.split("|").filter(Boolean).map((c) => c.trim());
      if (!inTable) {
        tableHeader = cells;
        inTable = true;
        continue;
      }
      if (cells.every((c) => /^[-:]+$/.test(c))) continue;
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (line.startsWith("- **") || line.startsWith("- ")) {
      flushTable();
      if (!inList) inList = true;
      const text = line.replace(/^- /, "");
      listItems.push(<li key={`li-${i}`} dangerouslySetInnerHTML={{ __html: inlineFormat(text) }} />);
      continue;
    } else if (inList) {
      flushList();
    }

    const gifMatch = line.match(/^!gif\[(.+?)\]$/);
    if (gifMatch) {
      const keyword = gifMatch[1].toLowerCase();
      const gif = TOPIC_GIFS[keyword];
      if (gif) {
        elements.push(
          <div key={`gif-${i}`} className="my-6 overflow-hidden rounded-2xl border border-[var(--color-line)]">
            <img src={gif.url} alt={gif.alt} className="w-full max-h-[300px] object-cover" loading="lazy" />
          </div>
        );
      }
      continue;
    }

    if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="mt-8 mb-3 text-[20px] font-bold text-[var(--color-ink)]">{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="mt-6 mb-2 text-[16px] font-bold text-[var(--color-ink)]">{line.slice(4)}</h3>);
    } else if (line.startsWith("---")) {
      elements.push(<hr key={i} className="my-8 border-[var(--color-line)]" />);
    } else if (line.trim() === "") {
      continue;
    } else {
      elements.push(
        <p key={i} className="my-3 text-[15px] leading-[1.75] text-[var(--color-ink-soft)]" dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />
      );
    }
  }

  flushList();
  flushTable();
  return elements;
}

function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[var(--color-ink)]">$1</strong>')
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="rounded bg-[var(--color-paper)] px-1.5 py-0.5 text-[13px] font-mono text-[var(--color-blue-ink)]">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="font-semibold text-[var(--color-blue-ink)] underline decoration-[var(--color-blue-ink)]/30 hover:decoration-[var(--color-blue-ink)]">$1</a>');
}

export function BlogPostView({ post }: { post: BlogPost }) {
  useEffect(() => { trackEvent("blog_post_read", { slug: post.slug, category: post.category }); }, [post.slug, post.category]);
  const shareText = `📚 ${post.title}\n\n${post.description}\n\nRead more 👉 https://bluebottlecap.com/blog/${post.slug}`;

  return (
    <article className="bbc mx-auto max-w-[720px] px-7 py-12">
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-ink-soft)] hover:text-[var(--color-blue-ink)] transition mb-6">
        <ArrowLeft className="h-4 w-4" /> All posts
      </Link>

      <div className="flex items-center gap-2 text-[12px]">
        <span className="rounded-full bg-[var(--color-blue-wash)] px-2.5 py-0.5 font-semibold text-[var(--color-blue-ink)]">
          {post.category}
        </span>
        <span className="flex items-center gap-1 text-[var(--color-ink-faint)]">
          <Clock className="h-3 w-3" /> {post.readTime} min read
        </span>
        <span className="text-[var(--color-ink-faint)]">
          {new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </span>
      </div>

      <PostHero post={post} />

      <h1 className="bbc-serif mt-4 text-[clamp(26px,4vw,38px)] leading-[1.12] tracking-[-.02em]">
        {post.title}
      </h1>

      <p className="mt-4 text-[16px] leading-relaxed text-[var(--color-ink-soft)] border-l-3 border-[var(--color-blue-ink)] pl-4 italic">
        {post.description}
      </p>

      <div className="mt-8 blog-content">
        {renderMarkdown(post.content)}
      </div>

      <div className="mt-10 flex flex-col gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6">
        <p className="text-[14px] font-bold text-[var(--color-ink)]">Found this helpful? Share it!</p>
        <div className="flex gap-3">
          <WhatsAppShare text={shareText} label="Share on WhatsApp" />
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: post.title, text: post.description, url: `/blog/${post.slug}` }).catch(() => {});
              } else {
                navigator.clipboard.writeText(`https://bluebottlecap.com/blog/${post.slug}`);
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-line)] px-4 py-2.5 text-[13.5px] font-bold text-[var(--color-ink-soft)] transition hover:border-[var(--color-blue-ink)] hover:text-[var(--color-blue-ink)]"
          >
            <Share2 className="h-4 w-4" /> Copy Link
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {post.tags.map((tag) => (
          <span key={tag} className="rounded-md bg-[var(--color-paper)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-ink-faint)]">
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
}

function PostHero({ post }: { post: BlogPost }) {
  const grad = CATEGORY_GRADIENTS[post.category];
  const gradient = post.heroGradient || grad?.gradient || "from-gray-600 to-gray-800";
  const emoji = post.heroEmoji || grad?.emoji || "📝";
  const [gifFailed, setGifFailed] = React.useState(false);

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--color-line)] h-[200px] sm:h-[260px] relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      {post.heroGif && !gifFailed ? (
        <img
          src={post.heroGif.url}
          alt={post.heroGif.alt}
          className="relative h-full w-full object-cover mix-blend-luminosity opacity-50"
          loading="eager"
          onError={() => setGifFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
      )}
      <div className="absolute bottom-4 right-4 text-[40px] drop-shadow-lg">{emoji}</div>
    </div>
  );
}
