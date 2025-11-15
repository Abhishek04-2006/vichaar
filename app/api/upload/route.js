import { v2 as cloudinary } from "cloudinary";

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file) {
      return Response.json({ success: false, message: "No file uploaded" });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const uploadRes = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "vichaar-posts" }, (err, result) => {
          if (err) reject(err);
          resolve(result);
        })
        .end(buffer);
    });

    return Response.json({
      success: true,
      url: uploadRes.secure_url,
    });

  } catch (err) {
    console.error("Cloudinary Error:", err);
    return Response.json({ success: false, message: "Upload failed" });
  }
}
