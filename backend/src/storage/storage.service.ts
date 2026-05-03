import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get('CLOUDINARY_API_KEY'),
      api_secret: this.config.get('CLOUDINARY_API_SECRET'),
    });
  }

  async upload(file: Express.Multer.File, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `yardly/${folder}`,
          transformation: [
            {
              width: 1280,
              height: 720,
              crop: 'fill',
              quality: 'auto',
              fetch_format: 'webp',
            },
          ],
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed'));
          resolve(result.secure_url);
        },
      );
      stream.end(file.buffer);
    });
  }

  async delete(url: string): Promise<void> {
    const publicId = this.extractPublicId(url);
    await cloudinary.uploader.destroy(publicId);
  }

  private extractPublicId(url: string): string {
    // https://res.cloudinary.com/yardly/image/upload/v123/yardly/fields/abc.webp
    // → yardly/fields/abc
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    return parts
      .slice(uploadIndex + 2) // sari peste 'upload' și version (v123)
      .join('/')
      .replace(/\.[^/.]+$/, ''); // elimină extensia
  }
}
