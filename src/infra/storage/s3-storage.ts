import {
  UploadParams,
  Uploader,
} from '@/domain/forum/application/storage/uploader'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { EnvService } from '../env/env.service'
import { randomUUID } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'

@Injectable()
export class S3Storage implements Uploader {
  private readonly s3Client: S3Client

  constructor(private envService: EnvService) {
    const region = envService.get('AWS_REGION')
    const accessKeyId = envService.get('AWS_ACCESS_KEY_ID')
    const secretAccessKey = envService.get('AWS_SECRET_ACCESS_KEY')

    this.s3Client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    })
  }

  async upload({
    body,
    fileName,
    fileType,
  }: UploadParams): Promise<{ url: string }> {
    const uploadId = randomUUID()
    const uniqueFileName = `${uploadId}-${fileName}`

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.envService.get('AWS_BUCKET_NAME'),
        Key: uniqueFileName,
        ContentType: fileType,
        Body: body,
        Expires: dayjs().add(1, 'day').toDate(),
      }),
    )

    return {
      url: uniqueFileName,
    }
  }
}
