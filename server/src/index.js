const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const { uploadFileToS3, listS3Objects, deleteS3Object } = require('./aws/s3Service');
const { saveVisionRecord, scanVisionRecords, deleteVisionRecord } = require('./aws/dynamoService');
const { analyzeImageVision } = require('./aws/rekognitionService');
const { isMockMode, region, bucketName, tableName } = require('./aws/clients');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory multer storage for memory buffer processing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ------------------------------------------------------------
// Health & AWS Infrastructure Diagnostics Endpoint
// ------------------------------------------------------------
app.get('/api/health', async (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    awsMode: isMockMode ? 'Emulated Mock Engine' : 'Live AWS SDK v3',
    awsRegion: region,
    s3Bucket: bucketName,
    dynamoTable: tableName,
    services: {
      s3: 'active',
      dynamoDB: 'active',
      rekognition: 'active'
    }
  });
});

// ------------------------------------------------------------
// Analyze Image & Store in AWS (S3 + Rekognition + DynamoDB)
// ------------------------------------------------------------
app.post('/api/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const file = req.file;
    const timestamp = Math.floor(Date.now() / 1000);
    const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const s3Key = `uploads/${timestamp}_${cleanFileName}`;

    console.log(`[AWS Pipeline] Processing file: ${cleanFileName} (${file.size} bytes)...`);

    // 1. Run AWS Rekognition Vision Detection
    const visionData = await analyzeImageVision(file.buffer, file.originalname);

    // 2. Upload Binary Object to AWS S3 Bucket
    const s3Result = await uploadFileToS3(s3Key, file.buffer, file.mimetype, file.originalname);

    // Calculate confidence average
    const confidenceSum = visionData.labels.reduce((acc, l) => acc + l.Confidence, 0);
    const confidenceAverage = visionData.labels.length > 0
      ? Number((confidenceSum / visionData.labels.length).toFixed(1))
      : 95.0;

    // 3. Index Record into AWS DynamoDB Table
    const recordPayload = {
      fileName: file.originalname,
      s3Key,
      s3Url: s3Result.s3Url || `https://${bucketName}.s3.amazonaws.com/${s3Key}`,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      category: visionData.category,
      confidenceAverage,
      labels: visionData.labels,
      detectedTexts: visionData.texts
    };

    const dynamoRecord = await saveVisionRecord(recordPayload);

    console.log(`[AWS Pipeline] Success! Saved to S3 (${s3Key}) & DynamoDB (${dynamoRecord.id})`);

    res.json({
      message: 'Image analyzed and stored in AWS successfully!',
      record: dynamoRecord,
      s3Key,
      s3Url: recordPayload.s3Url
    });
  } catch (error) {
    console.error('[AWS Pipeline] Error processing request:', error);
    res.status(500).json({
      error: 'Failed to process image with AWS services.',
      details: error.message
    });
  }
});

// ------------------------------------------------------------
// List Files in Amazon S3 Storage Bucket
// ------------------------------------------------------------
app.get('/api/s3/files', async (req, res) => {
  try {
    const files = await listS3Objects();
    res.json({ files });
  } catch (error) {
    console.error('[AWS S3] Error listing bucket files:', error);
    res.status(500).json({ error: 'Failed to retrieve S3 bucket files.', details: error.message });
  }
});

// ------------------------------------------------------------
// Delete Object from S3 & Record from DynamoDB
// ------------------------------------------------------------
app.delete('/api/s3/files/*', async (req, res) => {
  try {
    const key = req.params[0];
    if (!key) return res.status(400).json({ error: 'Missing object key' });

    await deleteS3Object(key);
    res.json({ message: `Successfully deleted object '${key}' from AWS S3.` });
  } catch (error) {
    console.error('[AWS S3] Error deleting object:', error);
    res.status(500).json({ error: 'Failed to delete object from S3.', details: error.message });
  }
});

// ------------------------------------------------------------
// Fetch All Indexed Records from Amazon DynamoDB Table
// ------------------------------------------------------------
app.get('/api/dynamo/records', async (req, res) => {
  try {
    const records = await scanVisionRecords();
    res.json({ records });
  } catch (error) {
    console.error('[AWS DynamoDB] Error scanning records:', error);
    res.status(500).json({ error: 'Failed to fetch DynamoDB records.', details: error.message });
  }
});

// ------------------------------------------------------------
// Delete Record from Amazon DynamoDB Table by ID
// ------------------------------------------------------------
app.delete('/api/dynamo/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteVisionRecord(id);
    res.json({ message: `Successfully deleted record '${id}' from DynamoDB.` });
  } catch (error) {
    console.error('[AWS DynamoDB] Error deleting record:', error);
    res.status(500).json({ error: 'Failed to delete record from DynamoDB.', details: error.message });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` CloudVision Hub Backend Server Running on Port ${PORT}`);
  console.log(` AWS Mode: ${isMockMode ? 'Emulated Mock Engine' : 'Live AWS SDK v3'}`);
  console.log(` Region: ${region} | S3: ${bucketName} | DynamoDB: ${tableName}`);
  console.log(`=======================================================`);
});
