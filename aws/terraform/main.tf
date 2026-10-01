terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "app_name" {
  type    = string
  default = "cloudvision-hub"
}

# ------------------------------------------------------------
# Amazon S3 Storage Bucket
# ------------------------------------------------------------
resource "aws_s3_bucket" "vision_bucket" {
  bucket        = "${var.app_name}-media-storage"
  force_destroy = true
}

resource "aws_s3_bucket_cors_configuration" "vision_cors" {
  bucket = aws_s3_bucket.vision_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}

# ------------------------------------------------------------
# Amazon DynamoDB Table
# ------------------------------------------------------------
resource "aws_dynamodb_table" "vision_table" {
  name         = "CloudVisionRecords"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "category"
    type = "S"
  }

  global_secondary_index {
    name            = "CategoryIndex"
    hash_key        = "category"
    projection_type = "ALL"
  }

  tags = {
    Environment = "production"
    Application = "CloudVisionHub"
  }
}

# ------------------------------------------------------------
# IAM Policy for Application User / Role
# ------------------------------------------------------------
resource "aws_iam_policy" "cloudvision_access_policy" {
  name        = "CloudVisionHubFullAccess"
  path        = "/"
  description = "IAM policy granting permissions for S3, DynamoDB, and Rekognition"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket",
          "s3:DeleteObject"
        ]
        Resource = [
          aws_s3_bucket.vision_bucket.arn,
          "${aws_s3_bucket.vision_bucket.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:Scan",
          "dynamodb:Query",
          "dynamodb:DeleteItem"
        ]
        Resource = aws_dynamodb_table.vision_table.arn
      },
      {
        Effect = "Allow"
        Action = [
          "rekognition:DetectLabels",
          "rekognition:DetectText",
          "rekognition:DetectFaces"
        ]
        Resource = "*"
      }
    ]
  })
}

output "s3_bucket_name" {
  value = aws_s3_bucket.vision_bucket.id
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.vision_table.name
}
