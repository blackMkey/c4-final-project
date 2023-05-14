import * as AWS from 'aws-sdk'
import { createLogger } from '../utils/logger'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('attachmentUtils')

// TODO: Implement the dataLayer logic

const s3Client = new XAWS.S3({ signatureVersion: 'v4' })
const s3Bucket = process.env.ATTACHMENT_S3_BUCKET
const signedUrlExpiration: number = +process.env.SIGNED_URL_EXPIRATION

export async function getPutSignedUrl(key: string): Promise<string> {
  const signedUrlExpireSeconds = 60 * signedUrlExpiration

  const url = await s3Client.getSignedUrl('putObject', {
    Bucket: s3Bucket,
    Key: key,
    Expires: signedUrlExpireSeconds
  })
  logger.info(`get attachmentUrl!`, { url })
  return url
}
