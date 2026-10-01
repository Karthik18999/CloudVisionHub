const { S3Client } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { RekognitionClient } = require('@aws-sdk/client-rekognition');
require('dotenv').config();

const region = process.env.AWS_REGION || 'us-east-1';
const hasAwsCreds = Boolean(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_ACCESS_KEY_ID.trim() !== '' &&
  process.env.AWS_SECRET_ACCESS_KEY.trim() !== ''
);

const forceMock = process.env.USE_MOCK_AWS === 'true';
const isMockMode = forceMock || !hasAwsCreds;

let s3Client = null;
let dynamoDocClient = null;
let rekognitionClient = null;

if (!isMockMode) {
  const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  };

  try {
    s3Client = new S3Client({ region, credentials });
    const dbRaw = new DynamoDBClient({ region, credentials });
    dynamoDocClient = DynamoDBDocumentClient.from(dbRaw);
    rekognitionClient = new RekognitionClient({ region, credentials });
    console.log(`[AWS SDK v3] Initialized live AWS Clients in region (${region}).`);
  } catch (err) {
    console.warn('[AWS SDK v3] Failed to initialize live clients, switching to Mock Mode:', err.message);
  }
} else {
  console.log(`[AWS System] Running in Emulated Mock Mode (No live AWS credentials required).`);
}

module.exports = {
  s3Client,
  dynamoDocClient,
  rekognitionClient,
  isMockMode,
  region,
  bucketName: process.env.S3_BUCKET_NAME || 'cloudvision-storage-bucket',
  tableName: process.env.DYNAMODB_TABLE_NAME || 'CloudVisionRecords'
};
