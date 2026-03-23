import { Upload } from "@aws-sdk/lib-storage";
import {s3Client} from "../config/s3config.js"
import sharp from "sharp";
import crypto from "crypto"

const generateKey = (file, folder) => {
  const hash = crypto.createHash("md5").update(file.buffer).digest("hex");
  const ext = file.originalname.split(".").pop();
  return `${folder}/${hash}.${ext}`;
};

const compressImage = async (buffer) => {
  return await sharp(buffer)
    .resize({ width: 800, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
};

export const uploadToS3 = async (file, folder) => {
  let fileBuffer = file.buffer;
  let contentType = file.mimetype;

  // Compress only images
  if (file.mimetype.startsWith("image/")) {
    fileBuffer = await compressImage(file.buffer);
    contentType = "image/jpeg";
  }

  const key = generateKey(file, folder);

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      CacheControl: "max-age=31536000", // cache for 1 year
    },
  });

  await upload.done();
  return key; // return key, not URL
};