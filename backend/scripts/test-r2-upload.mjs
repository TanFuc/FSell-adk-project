import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { performance } from 'node:perf_hooks';
import sharp from 'sharp';

const baseUrl = process.env.TEST_API_BASE_URL || 'http://localhost:3010/api';
const adminEmail = process.env.TEST_ADMIN_EMAIL || 'admin@adkpharma.vn';
const adminPassword = process.env.TEST_ADMIN_PASSWORD || 'Admin@2025';

const tempDir = path.join(os.tmpdir(), 'adk-r2-upload-tests');
await fs.mkdir(tempDir, { recursive: true });

const files = {
  small: path.join(tempDir, 'small.jpg'),
  large: path.join(tempDir, 'large.jpg'),
  oversize: path.join(tempDir, 'oversize.png'),
  text: path.join(tempDir, 'not-image.txt'),
  downloaded: path.join(tempDir, 'downloaded.webp'),
};

async function generateFixtures() {
  await sharp({
    create: {
      width: 1400,
      height: 900,
      channels: 3,
      background: { r: 40, g: 160, b: 120 },
    },
  })
    .jpeg({ quality: 92 })
    .toFile(files.small);

  const largeW = 4200;
  const largeH = 3000;
  const largeRaw = crypto.randomBytes(largeW * largeH * 3);
  await sharp(largeRaw, { raw: { width: largeW, height: largeH, channels: 3 } })
    .jpeg({ quality: 96 })
    .toFile(files.large);

  const overW = 3200;
  const overH = 3200;
  const overRaw = crypto.randomBytes(overW * overH * 3);
  await sharp(overRaw, { raw: { width: overW, height: overH, channels: 3 } })
    .png({ compressionLevel: 0 })
    .toFile(files.oversize);

  await fs.writeFile(files.text, 'hello upload test');
}

async function login() {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(`Login failed (${response.status}): ${JSON.stringify(body)}`);
  }

  return body.data.accessToken;
}

async function upload(filePath, mimeType, token) {
  const fileData = await fs.readFile(filePath);
  const form = new FormData();
  form.append('file', new Blob([fileData], { type: mimeType }), path.basename(filePath));

  const started = performance.now();
  const response = await fetch(`${baseUrl}/photo/admin/upload`, {
    method: 'POST',
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  const elapsedMs = performance.now() - started;

  let bodyText = await response.text();
  let body;
  try {
    body = JSON.parse(bodyText);
  } catch {
    body = bodyText;
  }

  return {
    status: response.status,
    elapsedMs: Number(elapsedMs.toFixed(1)),
    body,
  };
}

async function uploadMissingFile(token) {
  const started = performance.now();
  const response = await fetch(`${baseUrl}/photo/admin/upload`, {
    method: 'POST',
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  });
  const elapsedMs = performance.now() - started;

  let bodyText = await response.text();
  let body;
  try {
    body = JSON.parse(bodyText);
  } catch {
    body = bodyText;
  }

  return {
    status: response.status,
    elapsedMs: Number(elapsedMs.toFixed(1)),
    body,
  };
}

await generateFixtures();
const token = await login();

const smallUpload = await upload(files.small, 'image/jpeg', token);
const largeUpload = await upload(files.large, 'image/jpeg', token);
const noAuthUpload = await upload(files.small, 'image/jpeg', '');
const textUpload = await upload(files.text, 'text/plain', token);
const oversizeUpload = await upload(files.oversize, 'image/png', token);
const missingFileUpload = await uploadMissingFile(token);

let transformedMeta = null;
let transformedMetaError = null;
const uploadedLargeData = largeUpload.body?.data;
if (largeUpload.status === 201 && uploadedLargeData?.imageUrl) {
  try {
    const imageRes = await fetch(uploadedLargeData.imageUrl);
    const imageBuf = Buffer.from(await imageRes.arrayBuffer());
    await fs.writeFile(files.downloaded, imageBuf);
    transformedMeta = await sharp(imageBuf).metadata();
  } catch (error) {
    transformedMetaError = error instanceof Error ? error.message : String(error);
  }
}

const result = {
  baseUrl,
  fixtures: {
    smallBytes: (await fs.stat(files.small)).size,
    largeBytes: (await fs.stat(files.large)).size,
    oversizeBytes: (await fs.stat(files.oversize)).size,
  },
  success: {
    smallUpload,
    largeUpload,
  },
  validation: {
    transformedMeta,
    transformedMetaError,
  },
  errors: {
    noAuthUpload,
    textUpload,
    oversizeUpload,
    missingFileUpload,
  },
};

console.log(JSON.stringify(result, null, 2));
