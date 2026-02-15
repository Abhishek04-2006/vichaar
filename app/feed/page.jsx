"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import useAuth from "@/hooks/useAuth";
import Postcard from "@/components/Postcard";
import PeopleYouMayKnow from "@/components/PeopleYouMayKnow";
import TrendingHashtags from "@/components/TrendingHashtags";

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [news, setNews] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get following list
  useEffect(() => {
    if (!user?.id) return;

    const fetchFollowing = async () => {
      const { data } = await supabase
        .from('users')
        .select('following')
        .eq('id', user.id)
        .single();

      setFollowing(data?.following || []);
    };

    fetchFollowing();

    // Subscribe to changes
    const subscription = supabase
      .channel('user-following')
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          setFollowing(payload.new.following || []);
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [user]);

  // Fetch feed posts
  useEffect(() => {
    if (!following || following.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .in('author_id', following)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    };

    fetchPosts();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('feed-posts')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && following.includes(payload.new.author_id)) {
            setPosts(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPosts(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
          } else if (payload.eventType === 'DELETE') {
            setPosts(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [following]);

  // Fetch news
  useEffect(() => {
    fetch('https://saurav.tech/NewsAPI/top-headlines/category/general/in.json')
      .then(res => res.json())
      .then(data => {
        const newsItems = data.articles?.slice(0, 10).map((article, i) => ({ // Take top 10
          id: `news-${i}`,
          content: `${article.title}\n\n${article.description || ''}`,
          image: article.urlToImage,
          author_id: 'news-bot', // Dummy ID
          author_name: article.source.name || 'Daily News',
          author_photo: 'https://cdn-icons-png.flaticon.com/512/21/21601.png',
          created_at: article.publishedAt,
          likes: [],
          bookmarks: [],
          reactions: {},
          type: 'news',
          url: article.url,
          comment_count: 0
        })) || [];
        setNews(newsItems);
      })
      .catch(err => console.error("News fetch error", err));
  }, []);

  // Merge posts and news
  const mergedPosts = [...posts, ...news].sort((a, b) =>
    new Date(b.created_at) - new Date(a.created_at)
  );

  return (
    <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Main Feed */}
      <div className="md:col-span-2 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : following.length === 0 && news.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">
            Follow people to see posts 👀
          </p>
        ) : mergedPosts.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">
            No posts or news available right now.
          </p>
        ) : (
          mergedPosts.map(post => (
            <Postcard key={post.id} post={post} />
          ))
        )}
      </div>

      {/* Sidebar (Hidden on mobile) */}
      <div className="hidden md:block space-y-6">
        <TrendingHashtags limit={8} />
        <PeopleYouMayKnow />
      </div>
    </div>
  );
}
