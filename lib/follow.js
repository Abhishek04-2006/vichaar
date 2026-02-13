import { supabase } from "@/lib/supabase";

export async function followUser(myUid, targetUid) {
  // Get current arrays
  const { data: myData } = await supabase
    .from('users')
    .select('following')
    .eq('id', myUid)
    .single();

  const { data: targetData } = await supabase
    .from('users')
    .select('followers')
    .eq('id', targetUid)
    .single();

  const myFollowing = myData?.following || [];
  const targetFollowers = targetData?.followers || [];

  // Add to arrays if not already present
  if (!myFollowing.includes(targetUid)) {
    myFollowing.push(targetUid);
  }
  if (!targetFollowers.includes(myUid)) {
    targetFollowers.push(myUid);
  }

  // Update both users
  await supabase
    .from('users')
    .update({ following: myFollowing })
    .eq('id', myUid);

  await supabase
    .from('users')
    .update({ followers: targetFollowers })
    .eq('id', targetUid);
}

export async function unfollowUser(myUid, targetUid) {
  // Get current arrays
  const { data: myData } = await supabase
    .from('users')
    .select('following')
    .eq('id', myUid)
    .single();

  const { data: targetData } = await supabase
    .from('users')
    .select('followers')
    .eq('id', targetUid)
    .single();

  const myFollowing = (myData?.following || []).filter(id => id !== targetUid);
  const targetFollowers = (targetData?.followers || []).filter(id => id !== myUid);

  // Update both users
  await supabase
    .from('users')
    .update({ following: myFollowing })
    .eq('id', myUid);

  await supabase
    .from('users')
    .update({ followers: targetFollowers })
    .eq('id', targetUid);
}
