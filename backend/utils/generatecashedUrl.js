import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../config/s3config.js";
import Song from "../model/song.js";
import dotenv from "dotenv"

dotenv.config();

export const getCachedUrls = async (song) => {
  const now = new Date();
  const isExpired = !song.urlExpiresAt || song.urlExpiresAt <= now;

  if (!isExpired) {
    // Return cached URLs — no S3 request made
    return { songUrl: song.songUrl, imageUrl: song.imageUrl };
  }

  const[songUrl, imageUrl] = await Promise.all([
    getSignedUrl(s3Client, new GetObjectCommand({
        Bucket:process.env.S3_BUCKET_NAME,
        Key:song.songKey,
    }),{expiresIn:86400}),

    getSignedUrl(s3Client, new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: song.imageKey,
    }), { expiresIn: 86400 })
  ])

    await Song.findByIdAndUpdate(song._id, {
    songUrl,
    imageUrl,
    urlExpiresAt: new Date(Date.now() + 23 * 60 * 60 * 1000), // 23 hours
  });

  return { songUrl, imageUrl };
};
