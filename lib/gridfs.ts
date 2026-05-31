import mongoose from 'mongoose';
import { Readable } from 'stream';

let gfsImage: mongoose.mongo.GridFSBucket | null = null;
let dbConnection: mongoose.Connection | null = null;

export function initializeGridFS(db: mongoose.Connection) {
  dbConnection = db;
  // Don't create the bucket immediately, wait until it's actually needed
  // This ensures the connection is fully established
  gfsImage = null; // Reset to force re-initialization
}

export function getGridFS(): mongoose.mongo.GridFSBucket {
  if (gfsImage) {
    return gfsImage;
  }

  if (!dbConnection) {
    throw new Error('Database connection not initialized. Call initializeGridFS first.');
  }

  // Lazy initialization - create the bucket on first use
  if (!dbConnection.db) {
    throw new Error('MongoDB connection not fully established');
  }

  gfsImage = new mongoose.mongo.GridFSBucket(dbConnection.db, {
    bucketName: 'kyc_images',
  });

  return gfsImage;
}

export async function uploadFileToGridFS(
  buffer: Buffer,
  filename: string,
  metadata?: Record<string, unknown>
): Promise<mongoose.Types.ObjectId> {
  const gfs = getGridFS();
  const uploadStream = gfs.openUploadStream(filename, {
    metadata: metadata ?? {},
  });

  return new Promise((resolve, reject) => {
    Readable.from(buffer)
      .pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => {
        resolve(uploadStream.id as unknown as mongoose.Types.ObjectId);
      });
  });
}

export async function downloadFileFromGridFS(
  fileId: mongoose.Types.ObjectId
): Promise<Buffer> {
  const gfs = getGridFS();
  const downloadStream = gfs.openDownloadStream(
    new mongoose.mongo.ObjectId(fileId.toString())
  );

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    downloadStream
      .on('data', (chunk: Buffer) => chunks.push(chunk))
      .on('error', reject)
      .on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export async function deleteFileFromGridFS(
  fileId: mongoose.Types.ObjectId
): Promise<void> {
  const gfs = getGridFS();
  await gfs.delete(new mongoose.mongo.ObjectId(fileId.toString()));
}