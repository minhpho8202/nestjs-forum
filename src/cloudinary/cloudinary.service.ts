import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './response/cloudinary-response';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
    // uploadImage(file: Express.Multer.File): Promise<CloudinaryResponse> {
    //     return new Promise<CloudinaryResponse>((resolve, reject) => {
    //         const uploadStream = cloudinary.uploader.upload_stream(
    //             (error, result) => {
    //                 if (error) return reject(error);
    //                 resolve(result);
    //             },
    //         );

    //         streamifier.createReadStream(file.buffer).pipe(uploadStream);
    //     });
    // }

    // async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    //     try {
    //         const uploadPromises = files.map(file => this.uploadImage(file));
    //         const uploadedResults = await Promise.all(uploadPromises);
    //         return uploadedResults.map(result => result.secure_url);
    //     } catch (error) {
    //         throw new Error(`Failed to upload files: ${error.message}`);
    //     }
    // }
    uploadImage(file: Express.Multer.File): Promise<{ secure_url: string; public_id: string }> {
        return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (error) return reject(error);
                    resolve({
                        secure_url: result.secure_url,
                        public_id: result.public_id,
                    });
                },
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }

    async deleteImage(publicId: string): Promise<void> {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            throw new Error(`Failed to delete image with publicId "${publicId}": ${error.message}`);
        }
    }
}


