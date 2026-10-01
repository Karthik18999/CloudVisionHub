const {
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  GetObjectCommand
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, isMockMode, bucketName } = require('./clients');
const mockAwsEngine = require('./mockAwsEngine');

async function uploadFileToS3(key, buffer, mimeType, fileName) {
  if (isMockMode) {
    return mockAwsEngine.putS3Object(key, buffer, mimeType, fileName);
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    Metadata: {
      originalName: fileName || key
    }
  });

  await s3Client.send(command);
  const s3Url = `https://${bucketName}.s3.amazonaws.com/${key}`;
  return { s3Key: key, s3Url, bucket: bucketName };
}

async function listS3Objects() {
  if (isMockMode) {
    return mockAwsEngine.listS3Objects();
  }

  const command = new ListObjectsV2Command({ Bucket: bucketName });
  const response = await s3Client.send(command);

  if (!response.Contents) return [];

  const files = await Promise.all(
    response.Contents.map(async (item) => {
      let presignedUrl = `https://${bucketName}.s3.amazonaws.com/${item.Key}`;
      try {
        const getCmd = new GetObjectCommand({ Bucket: bucketName, Key: item.Key });
        presignedUrl = await getSignedUrl(s3Client, getCmd, { expiresIn: 3600 });
      } catch (err) {
        // Fallback to standard object URL
      }

      return {
        Key: item.Key,
        FileName: item.Key.split('/').pop(),
        Size: item.Size,
        LastModified: item.LastModified,
        Url: presignedUrl
      };
    })
  );

  return files;
}

async function deleteS3Object(key) {
  if (isMockMode) {
    return mockAwsEngine.deleteS3Object(key);
  }

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key
  });

  await s3Client.send(command);
  return true;
}

module.exports = {
  uploadFileToS3,
  listS3Objects,
  deleteS3Object
};
