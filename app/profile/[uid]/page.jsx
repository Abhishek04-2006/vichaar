"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import useAuth from "@/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";
import Postcard from "@/components/Postcard";

export default function OtherProfile({ params }) {
  const { uid } = use(params);
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Load Profile User & Posts
  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch User Profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .single();

      if (userData) {
        setProfileUser(userData);

        // Check if I follow them
        if (currentUser) {
          // We need to fetch MY user data to see following list
          const { data: myData } = await supabase
            .from('users')
            .select('following')
            .eq('id', currentUser.id)
            .single();

          if (myData?.following?.includes(uid)) {
            setIsFollowing(true);
          }
        }
      }

      // 2. Fetch User Posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', uid)
        .order('created_at', { ascending: false });

      if (postsData) setUserPosts(postsData);

      setLoading(false);
    };

    fetchData();
  }, [uid, currentUser]);

  const handleMessage = async () => {
    if (!currentUser) return alert("Login to message users");
    if (startingChat) return;
    setStartingChat(true);

    try {
      // 1. Check if chat exists
      // Supabase: we can query where participants array contains BOTH user IDs
      // However, "contains" operator works if array contains ALL elements provided.
      const { data: existingChats, error } = await supabase
        .from('chats')
        .select('id')
        .contains('participants', [currentUser.id, uid])
        .limit(1);

      if (existingChats && existingChats.length > 0) {
        router.push(`/chat/${existingChats[0].id}`);
      } else {
        // 2. Create new chat
        const { data: newChat, error: createError } = await supabase
          .from('chats')
          .insert({
            participants: [currentUser.id, uid],
            last_message: "",
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;
        router.push(`/chat/${newChat.id}`);
      }
    } catch (err) {
      console.error("Chat start error", err);
      alert("Failed to start chat");
      setStartingChat(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return alert("Login to follow users");
    setFollowLoading(true);

    try {
      // Logic:
      // 1. Update MY 'following' array
      // 2. Update THEIR 'followers' array

      const myId = currentUser.id;
      const theirId = uid;

      // Get current arrays first (safe way)
      const { data: myData } = await supabase.from('users').select('following').eq('id', myId).single();
      const { data: theirData } = await supabase.from('users').select('followers').eq('id', theirId).single();

      let newFollowing = myData.following || [];
      let newFollowers = theirData.followers || [];

      if (isFollowing) {
        // UNFOLLOW
        newFollowing = newFollowing.filter(id => id !== theirId);
        newFollowers = newFollowers.filter(id => id !== myId);
      } else {
        // FOLLOW
        if (!newFollowing.includes(theirId)) newFollowing.push(theirId);
        if (!newFollowers.includes(myId)) newFollowers.push(myId);

        // Send Notification
        await supabase.from('notifications').insert({
          user_id: theirId,
          type: 'follow',
          sender_id: myId,
          sender_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0],
          sender_photo: currentUser.user_metadata?.avatar_url,
          message: 'started following you',
          read: false
        });
      }

      // Perform Updates
      await supabase.from('users').update({ following: newFollowing }).eq('id', myId);
      await supabase.from('users').update({ followers: newFollowers }).eq('id', theirId);

      setIsFollowing(!isFollowing);
      // Update local profile stats optimistically
      setProfileUser(prev => ({
        ...prev,
        followers: newFollowers
      }));

    } catch (err) {
      console.error("Follow error:", err);
      alert("Action failed");
    } finally {
      setFollowLoading(false);
    }
  };


  if (loading) return <div className="p-10 text-center text-gray-500">Loading profile...</div>;

  if (!profileUser) return (
    <div className="p-10 text-center">
      <h2 className="text-xl font-bold text-gray-700">User not found</h2>
      <p className="text-gray-500">The user you are looking for does not exist.</p>
    </div>
  );

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="rounded-xl shadow-xl overflow-hidden bg-white dark:bg-gray-900">

        {/* Cover area */}
        <div className="relative h-56 md:h-64 bg-gradient-to-r from-purple-800 to-indigo-900">
          {profileUser.cover_url && (
            <div className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profileUser.cover_url}
                alt="Cover"
                className="w-full h-full object-cover opacity-80"
              />
            </div>
          )}

          <div className="absolute left-6 -bottom-12 flex items-end gap-6">
            <Avatar src={profileUser.photo_url} size={128} className="ring-4 ring-white dark:ring-gray-900 bg-white" />

            <div className="text-white dark:text-white pl-2 pb-2 drop-shadow-md">
              <h1 className="text-3xl font-extrabold leading-tight">{profileUser.name || profileUser.email?.split("@")[0]}</h1>
              <p className="text-sm opacity-90">@{profileUser.email?.split("@")[0]}</p>
            </div>
          </div>
        </div>

        {/* Profile Info & Actions */}
        <div className="pt-16 pb-8 px-8">
          <div className="flex justify-end gap-3 mb-6">
            {currentUser && currentUser.id !== uid && (
              <>
                <button
                  onClick={handleMessage}
                  disabled={startingChat}
                  className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-full font-medium transition disabled:opacity-50"
                >
                  {startingChat ? "Opening..." : "Message"}
                </button>

                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-6 py-2 rounded-full font-medium transition disabled:opacity-50 ${isFollowing
                      ? "bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                >
                  {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
                </button>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About & Stats */}
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl">
                <h3 className="text-lg font-bold mb-2">About</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{profileUser.bio || "No bio available."}</p>
              </div>

              <div className="flex justify-between px-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                <div className="text-center">
                  <div className="text-xl font-bold">{userPosts.length}</div>
                  <div className="text-xs text-gray-500">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{profileUser.followers?.length || 0}</div>
                  <div className="text-xs text-gray-500">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{profileUser.following?.length || 0}</div>
                  <div className="text-xs text-gray-500">Following</div>
                </div>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-bold border-b pb-2 mb-4 dark:border-gray-800">Posts</h3>
              {userPosts.length === 0 ? (
                <p className="text-gray-500 italic text-center py-10">No posts yet.</p>
              ) : (
                userPosts.map(post => <Postcard key={post.id} post={post} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
