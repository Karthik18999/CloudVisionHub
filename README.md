# CloudVision Hub ☁️

**CloudVision Hub** is a full-stack Enterprise AI Computer Vision & Document Intelligence Application powered by **Amazon Web Services** (**AWS S3**, **AWS DynamoDB**, **AWS Rekognition**, and **AWS SAM / Terraform Infrastructure as Code**).

It includes an integrated **Google MobileNet Neural Network Deep Learning Model** for real-time computer vision object classification (Plants, Monuments, Animals, Vehicles, Food, Documents) and automated indexing into AWS cloud storage and NoSQL databases.

---

## 🏛️ System Architecture

```mermaid
graph TD
    A[React Dashboard Client - Port 3000] -->|REST API| B[Express API Server - Port 5000]
    B -->|Neural Engine| C[MobileNet Deep Learning Classifier]
    B -->|@aws-sdk/client-s3| D[Amazon S3 - Object Storage Bucket]
    B -->|@aws-sdk/client-rekognition| E[AWS Rekognition - Vision & OCR]
    B -->|@aws-sdk/lib-dynamodb| F[Amazon DynamoDB - NoSQL Table]
```

---

## 🌟 Key Features & Capabilities

- 🤖 **Neural AI Object Classification**: Powered by Google MobileNet Neural Network deep learning models for classifying image pixels into real-world categories (**Plants & Flora**, **Monuments & Statues**, **Animals & Pets**, **Vehicles**, **Documents & OCR**, **Food**, **Tech**).
- 🪣 **Amazon S3 Object Storage**: Media storage for binary assets, uploaded documents, presigned access links, and storage bucket metrics.
- ⚡ **Amazon DynamoDB NoSQL Indexing**: High-speed indexing of vision tags, confidence percentages, extracted text lines, and JSON document attribute inspection.
- 📜 **Infrastructure as Code (IaC)**: Production-ready AWS SAM (CloudFormation) templates, Terraform scripts, least-privilege IAM policies, and LocalStack emulation setups.
- 🔄 **Dual AWS Operating Mode**: Connects directly to live AWS cloud resources when credentials are set, or uses built-in Neural Engine emulation for instant offline testing.

---

## 🏷️ Supported AI Classification Categories

| Category | Example Objects Detected |
| :--- | :--- |
| 🌿 **Plants & Flora** | Houseplants, Pot / Flowerpot, Green Leaf Foliage, Botanical Flora, Flowers |
| 🗿 **Monuments & Statues** | Historical Statues, Chhatrapati Shivaji Maharaj Memorials, Sculptures, Landmarks |
| 🐶 **Animals & Pets** | Dogs, Cats, Birds, Wildlife, Mammals, Pets |
| 🚗 **Vehicles & Automotive** | Cars, Motorcycles, Trucks, Buses, Transportation |
| 📄 **Document & OCR** | Tax Invoices, Receipts, Contracts, Printed Text Lines, Paper Documents |
| 🍕 **Food & Culinary** | Prepared Dishes, Pizza, Meals, Fruits, Beverages |
| 💻 **Electronics & Tech** | Laptops, Mobile Devices, Displays, Hardware |

---

## 📁 Repository Directory Layout

```
aws-vision-hub/
├── aws/
│   ├── template.yaml          # AWS SAM CloudFormation Infrastructure Stack
│   ├── terraform/main.tf      # Terraform Script for S3, DynamoDB & IAM
│   ├── iam-policy.json        # Least-privilege IAM Security Policy
│   └── docker-compose.yml     # LocalStack local AWS container spec
├── server/
│   ├── src/
│   │   ├── aws/
│   │   │   ├── clients.js             # AWS SDK v3 client initializers
│   │   │   ├── neuralVision.js        # MobileNet Neural Network AI classifier
│   │   │   ├── pixelAnalyzer.js       # Real image pixel spectrum analyzer
│   │   │   ├── s3Service.js           # Amazon S3 storage manager
│   │   │   ├── dynamoService.js       # Amazon DynamoDB database manager
│   │   │   └── rekognitionService.js  # AWS Rekognition vision service
│   │   └── index.js                   # Express REST API server
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadVision.jsx       # Image uploader & AI results dashboard
│   │   │   ├── S3Browser.jsx          # S3 storage bucket manager
│   │   │   ├── DynamoInspector.jsx    # DynamoDB NoSQL table viewer
│   │   │   └── AwsConfigPanel.jsx     # AWS metrics & IaC deployment guides
│   │   ├── App.jsx                    # React application main shell
│   │   └── main.jsx
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start & Launch Guide

### 1. Launch Backend API Server (Port `5000`)
```powershell
cd server
npm install
npm start
```

### 2. Launch React Frontend Dashboard (Port `3000`)
```powershell
cd client
npm install
npm run dev
```

Open your browser at **[`http://localhost:3000`](http://localhost:3000)** to launch the application dashboard!

---

## 🔑 Live AWS Cloud Connection Setup

To connect CloudVision Hub to your live Amazon Web Services account:

1. Copy `server/.env.example` to `server/.env`.
2. Enter your live AWS credentials:

```env
PORT=5000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
S3_BUCKET_NAME=cloudvision-storage-bucket
DYNAMODB_TABLE_NAME=CloudVisionRecords
```

3. Restart the backend server (`npm start`). The app will automatically connect to your live **AWS S3**, **AWS DynamoDB**, and **AWS Rekognition** cloud resources!
