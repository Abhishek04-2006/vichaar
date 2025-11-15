import Image from "next/image";

export default function Postcard({ post }) {
  return (
    <div className="bg-[#1d2433] p-4 rounded-xl shadow text-white">

      {/* Post Text */}
      <p>{post.text}</p>

      {/* Post Image */}
      {post.image && (
        <Image
          src={post.image}
          width={600}
          height={350}
          alt="Post Image"
          className="rounded-xl mt-3 border border-gray-700"
        />
      )}
    </div>
  );
}
