import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { Readable } from 'stream';

let gfsImage: GridFSBucket;

export function initializeGridFS(db: mongoose.Connection) {
  gfsImage = new GridFSBucket(db.getClient().db(db.getName()), {
    bucketName: 'kyc_images',
  });
  return gfsImage;
}

export function getGridFS(): GridFSBucket {
  if (!gfsImage) {
    throw new Error('GridFS not initialized. Call initializeGridFS first.');
  }
  return gfsImage;
}

export async function uploadFileToGridFS(
  buffer: Buffer,
  filename: string,
  metadata?: Record<string, any>
): Promise<mongoose.Types.ObjectId> {
  const gfs = getGridFS();
  const uploadStream = gfs.openUploadStream(filename, {
    metadata: metadata || {},
  });

  return new Promise((resolve, reject) => {
    const readable = Readable.from(buffer);
    readable
      .pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => {
        resolve(uploadStream.id as mongoose.Types.ObjectId);
      });
  });
}

export async function downloadFileFromGridFS(
  fileId: mongoose.Types.ObjectId
): Promise<Buffer> {
  const gfs = getGridFS();
  const downloadStream = gfs.openDownloadStream(fileId);

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    downloadStream
      .on('data', (chunk) => chunks.push(chunk))
      .on('error', reject)
      .on('end', () => {
        resolve(Buffer.concat(chunks));
      });
  });
}

export async function deleteFileFromGridFS(
  fileId: mongoose.Types.ObjectId
): Promise<void> {
  const gfs = getGridFS();
  await gfs.delete(fileId);
}
