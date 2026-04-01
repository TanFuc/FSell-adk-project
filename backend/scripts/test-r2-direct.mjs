import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { performance } from 'node:perf_hooks';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

function loadEnvFile(filePath) {
  return fs.readFile(filePath, 'utf8').then((text) => {
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  });
}

const backendRoot = path.resolve(process.cwd());
await loadEnvFile(path.join(backendRoot, '.env'));

const endpoint = process.env.R2_ENDPOINT;
const key = process.env.R2_KEY;
const secret = process.env.R2_SECRET;
const bucket = process.env.R2_BUCKET;
const region = process.env.R2_REGION || 'auto';
const publicUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');

if (!endpoint || !key || !secret || !bucket) {
  throw new Error('Missing required R2 env vars (R2_ENDPOINT, R2_KEY, R2_SECRET, R2_BUCKET)');
}

const tempDir = path.join(os.tmpdir(), 'adk-r2-upload-tests');
await fs.mkdir(tempDir, { recursive: true });
const inputPath = path.join(tempDir, 'direct-input.jpg');

await sharp({
  create: {
    width: 4600,
    height: 3000,
    channels: 3,
    background: { r: 36, g: 101, b: 170 },
  },
})
  .composite([
    {
      input: Buffer.from(crypto.randomBytes(800 * 600 * 3)),
      raw: { width: 800, height: 600, channels: 3 },
      left: 100,
      top: 100,
    },
  ])
  .jpeg({ quality: 95 })
  .toFile(inputPath);

const input = await fs.readFile(inputPath);
const startedOptimize = performance.now();
const optimized = await sharp(input)
  .rotate()
  .resize({ width: Number(process.env.IMAGE_MAX_WIDTH || 2560), fit: 'inside', withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
  .sharpen({ sigma: 1.1, m1: 1.2, m2: 2.0, x1: 2.0, y2: 10.0, y3: 20.0 })
  .webp({ quality: Number(process.env.IMAGE_QUALITY || 88), effort: 5, smartSubsample: true })
  .toBuffer();
const optimizeMs = Number((performance.now() - startedOptimize).toFixed(1));

const s3 = new S3Client({
  region,
  endpoint,
  credentials: { accessKeyId: key, secretAccessKey: secret },
});

const objectKey = `uploads/test-direct-${Date.now()}.webp`;
const startedUpload = performance.now();
await s3.send(
  new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    Body: optimized,
    ContentType: 'image/webp',
    CacheControl: 'public, max-age=31536000, immutable',
  }),
);
const uploadMs = Number((performance.now() - startedUpload).toFixed(1));

const metadata = await sharp(optimized).metadata();

console.log(
  JSON.stringify(
    {
      optimizeMs,
      uploadMs,
      inputBytes: input.length,
      outputBytes: optimized.length,
      reductionPercent: Number(((1 - optimized.length / input.length) * 100).toFixed(2)),
      outputFormat: metadata.format,
      outputWidth: metadata.width,
      outputHeight: metadata.height,
      imageUrl: publicUrl ? `${publicUrl}/${objectKey}` : objectKey,
    },
    null,
    2,
  ),
);
