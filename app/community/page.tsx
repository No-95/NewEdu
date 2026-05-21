'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/ParticleBackground';
import { ClientOnly } from '@/lib/hooks/useClientOnly';

type MediaType = 'none' | 'image' | 'video';

interface PostComment {
  id: number;
  author: string;
  content: string;
  timeAgo: string;
}

interface CommunityPost {
  id: number;
  author: string;
  handle: string;
  avatar: string;
  content: string;
  mediaType: MediaType;
  mediaUrl?: string;
  tags: string[];
  likes: number;
  liked: boolean;
  comments: PostComment[];
  timeAgo: string;
}

interface Educator {
  id: number;
  name: string;
  title: string;
  expertise: string;
  followers: number;
  avatar: string;
}

function CommunityContent() {
  const [composer, setComposer] = useState({
    content: '',
    mediaType: 'none' as MediaType,
    mediaUrl: '',
  });
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});

  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: 1,
      author: 'Sarah Chen',
      handle: '@sarahlearns',
      avatar: 'SC',
      content:
        'I have been studying Korean for 6 months and still struggle with listening speed in factory meetings. Any practical drills you recommend?',
      mediaType: 'none',
      tags: ['#ListeningTips', '#KoreanAtWork'],
      likes: 56,
      liked: false,
      comments: [
        { id: 101, author: 'Min', content: 'Try shadowing 10 minutes/day with subtitles first.', timeAgo: '45m' },
        { id: 102, author: 'Duy', content: 'Use meeting vocabulary lists before each shift.', timeAgo: '20m' },
      ],
      timeAgo: '2 hours ago',
    },
    {
      id: 2,
      author: 'James Park',
      handle: '@jparkedu',
      avatar: 'JP',
      content: 'Mini walkthrough of my Korean production line terms cheat-sheet. Hope this helps newcomers.',
      mediaType: 'image',
      mediaUrl: '/placeholder.jpg',
      tags: ['#FactoryKorean', '#Beginner'],
      likes: 88,
      liked: false,
      comments: [{ id: 201, author: 'Linh', content: 'This format is super clear, thanks!', timeAgo: '1h' }],
      timeAgo: '5 hours ago',
    },
    {
      id: 3,
      author: 'Maria Rodriguez',
      handle: '@mariahr',
      avatar: 'MR',
      content: 'Recorded a short speaking practice video for shift handover expressions. Feedback welcome!',
      mediaType: 'video',
      mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      tags: ['#SpeakingPractice', '#ShiftHandover'],
      likes: 41,
      liked: false,
      comments: [{ id: 301, author: 'Alex', content: 'Great pronunciation pacing.', timeAgo: '2h' }],
      timeAgo: '1 day ago',
    },
  ]);

  const educators: Educator[] = [
    {
      id: 1,
      name: 'Park Min-jun',
      title: 'Native Korean Coach',
      expertise: 'Factory Communication',
      followers: 3420,
      avatar: 'PM',
    },
    {
      id: 2,
      name: 'Emily Watson',
      title: 'Pronunciation Mentor',
      expertise: 'Interview Korean',
      followers: 2870,
      avatar: 'EW',
    },
    {
      id: 3,
      name: 'Carlos Santos',
      title: 'QA/QC Language Trainer',
      expertise: 'Technical Vocabulary',
      followers: 1560,
      avatar: 'CS',
    },
    {
      id: 4,
      name: 'Yuki Tanaka',
      title: 'Production Korean Advisor',
      expertise: 'Daily Work Dialogues',
      followers: 2030,
      avatar: 'YT',
    },
  ];

  const trendingTopics = [
    '#FactoryKorean',
    '#InterviewTips',
    '#QCVocabulary',
    '#ShiftHandover',
    '#DailyExpressions',
    '#SMTLine',
    '#AutomationTerms',
    '#ProductionManagement',
  ];

  const createPost = (e: React.FormEvent) => {
    e.preventDefault();

    const text = composer.content.trim();
    const mediaUrl = composer.mediaUrl.trim();
    if (!text && !mediaUrl) return;

    const newPost: CommunityPost = {
      id: Date.now(),
      author: 'You',
      handle: '@you',
      avatar: 'YO',
      content: text || 'Shared a media update.',
      mediaType: mediaUrl ? composer.mediaType : 'none',
      mediaUrl: mediaUrl || undefined,
      tags: ['#NewPost'],
      likes: 0,
      liked: false,
      comments: [],
      timeAgo: 'Just now',
    };

    setPosts((prev) => [newPost, ...prev]);
    setComposer({ content: '', mediaType: 'none', mediaUrl: '' });
  };

  const toggleLike = (postId: number) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const nextLiked = !post.liked;
        return {
          ...post,
          liked: nextLiked,
          likes: nextLiked ? post.likes + 1 : Math.max(0, post.likes - 1),
        };
      })
    );
  };

  const addComment = (postId: number) => {
    const draft = (commentDrafts[postId] || '').trim();
    if (!draft) return;

    const comment: PostComment = {
      id: Date.now(),
      author: 'You',
      content: draft,
      timeAgo: 'Now',
    };

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [...post.comments, comment],
            }
          : post
      )
    );

    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ParticleBackground />
      <Header />

      <main className="relative z-10 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Community Feed</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              A social space for learners and educators to post text, images, videos, and collaborate through comments.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <aside className="lg:col-span-3 lg:sticky lg:top-24 h-fit space-y-5">
              <section className="glass rounded-2xl border border-border/50 p-5">
                <h2 className="text-lg font-bold mb-4">Trending Topics</h2>
                <div className="flex flex-wrap gap-2">
                  {trendingTopics.map((topic) => (
                    <button
                      key={topic}
                      className="rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </section>
            </aside>

            <section className="lg:col-span-6 space-y-5">
              <article className="glass rounded-2xl border border-border/50 p-5">
                <h2 className="text-lg font-bold mb-4">Create Post</h2>
                <form onSubmit={createPost} className="space-y-4">
                  <textarea
                    value={composer.content}
                    onChange={(e) => setComposer((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Share something with the community..."
                    className="w-full min-h-[120px] rounded-xl bg-muted/40 border border-border/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_2fr]">
                    <select
                      value={composer.mediaType}
                      onChange={(e) =>
                        setComposer((prev) => ({
                          ...prev,
                          mediaType: e.target.value as MediaType,
                        }))
                      }
                      className="rounded-lg bg-muted/40 border border-border/60 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="none">Text only</option>
                      <option value="image">Image post</option>
                      <option value="video">Video post</option>
                    </select>

                    <input
                      type="url"
                      value={composer.mediaUrl}
                      onChange={(e) => setComposer((prev) => ({ ...prev, mediaUrl: e.target.value }))}
                      placeholder="Paste image/video URL (optional)"
                      className="rounded-lg bg-muted/40 border border-border/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Post
                    </button>
                  </div>
                </form>
              </article>

              {posts.map((post) => (
                <article key={post.id} className="glass rounded-2xl border border-border/50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 text-primary font-semibold flex items-center justify-center text-sm">
                      {post.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground leading-tight">{post.author}</p>
                          <p className="text-xs text-muted-foreground">{post.handle} • {post.timeAgo}</p>
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-foreground/95">{post.content}</p>

                      {post.mediaType === 'image' && post.mediaUrl && (
                        <div className="mt-4 overflow-hidden rounded-xl border border-border/60">
                          <Image
                            src={post.mediaUrl}
                            alt="Post image"
                            width={1200}
                            height={700}
                            className="h-auto w-full object-cover"
                          />
                        </div>
                      )}

                      {post.mediaType === 'video' && post.mediaUrl && (
                        <div className="mt-4 overflow-hidden rounded-xl border border-border/60 bg-black">
                          <video controls className="w-full h-auto">
                            <source src={post.mediaUrl} />
                          </video>
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span key={`${post.id}-${tag}`} className="rounded-full bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center gap-5 text-sm">
                        <button
                          onClick={() => toggleLike(post.id)}
                          className={`transition-colors ${post.liked ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                        >
                          Like ({post.likes})
                        </button>
                        <button
                          onClick={() =>
                            setExpandedComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))
                          }
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          Comments ({post.comments.length})
                        </button>
                      </div>

                      {expandedComments[post.id] && (
                        <div className="mt-4 rounded-xl bg-muted/25 border border-border/40 p-4 space-y-3">
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="rounded-lg bg-background/50 border border-border/30 p-3">
                              <p className="text-xs text-muted-foreground">
                                <span className="font-semibold text-foreground">{comment.author}</span> • {comment.timeAgo}
                              </p>
                              <p className="mt-1 text-sm text-foreground/90">{comment.content}</p>
                            </div>
                          ))}

                          <div className="flex gap-2">
                            <input
                              value={commentDrafts[post.id] || ''}
                              onChange={(e) =>
                                setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))
                              }
                              placeholder="Write a comment..."
                              className="w-full rounded-lg border border-border/50 bg-background/70 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button
                              onClick={() => addComment(post.id)}
                              className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="lg:col-span-3 lg:sticky lg:top-24 h-fit space-y-5">
              <section className="glass rounded-2xl border border-border/50 p-5">
                <h2 className="text-lg font-bold mb-4">Suggested Educators</h2>
                <div className="space-y-3">
                  {educators.map((educator) => (
                    <div key={educator.id} className="rounded-xl border border-border/40 bg-muted/25 p-3">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-secondary/25 text-secondary font-semibold flex items-center justify-center text-sm">
                          {educator.avatar}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-foreground">{educator.name}</p>
                          <p className="text-xs text-primary">{educator.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{educator.expertise}</p>
                          <p className="text-xs text-muted-foreground mt-1">{educator.followers.toLocaleString()} followers</p>
                        </div>
                      </div>
                      <button className="mt-3 w-full rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors">
                        Follow
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CommunityPage() {
  return (
    <ClientOnly>
      <CommunityContent />
    </ClientOnly>
  );
}
