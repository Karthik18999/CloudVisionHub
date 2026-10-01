import React, { useState, useEffect } from 'react';
import { Server, Shield, FileCode, CheckCircle2, Cloud, Terminal, Cpu } from 'lucide-react';

export default function AwsConfigPanel() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error checking health:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner: Connection & AWS Region Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-lg">AWS Environment & Infrastructure Status</h3>
            <p className="text-xs text-slate-400">Live SDK connection telemetry and IaC configurations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Execution Engine</span>
            <span className="text-sm font-semibold text-amber-400 mt-1 flex items-center space-x-1.5">
              <Cpu className="w-4 h-4" />
              <span>{health?.awsMode || 'Detecting...'}</span>
            </span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Target AWS Region</span>
            <span className="text-sm font-semibold text-slate-100 font-mono mt-1 block">
              {health?.awsRegion || 'us-east-1'}
            </span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Target S3 Bucket</span>
            <span className="text-xs font-mono text-slate-300 mt-1 block truncate" title={health?.s3Bucket}>
              {health?.s3Bucket || 'cloudvision-storage-bucket'}
            </span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Target DynamoDB Table</span>
            <span className="text-xs font-mono text-emerald-400 mt-1 block truncate" title={health?.dynamoTable}>
              {health?.dynamoTable || 'CloudVisionRecords'}
            </span>
          </div>
        </div>
      </div>

      {/* Deployment & IaC Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SAM & CLI Instructions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
            <Terminal className="w-4 h-4" />
            <span>AWS SAM (CloudFormation) Deployment</span>
          </div>
          <p className="text-xs text-slate-400">
            Deploy the included <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-400 font-mono">aws/template.yaml</code> stack directly to your AWS cloud account using the AWS SAM CLI:
          </p>
          <pre className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 select-all overflow-x-auto">
{`# 1. Build AWS Serverless Application
sam build --template aws/template.yaml

# 2. Deploy resources to AWS cloud
sam deploy --guided`}
          </pre>
        </div>

        {/* Terraform Deployment Instructions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-blue-400 font-semibold text-sm">
            <FileCode className="w-4 h-4" />
            <span>Terraform Deployment</span>
          </div>
          <p className="text-xs text-slate-400">
            Or provision S3, DynamoDB, and IAM policies declaratively using Terraform from <code className="bg-slate-950 px-1.5 py-0.5 rounded text-blue-400 font-mono">aws/terraform/main.tf</code>:
          </p>
          <pre className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 select-all overflow-x-auto">
{`cd aws/terraform
terraform init
terraform apply -auto-approve`}
          </pre>
        </div>
      </div>

      {/* Active AWS Services Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h4 className="font-semibold text-slate-200 text-sm mb-4 flex items-center space-x-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Active AWS Cloud Services Architecture</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/80">
            <div className="font-semibold text-amber-400 text-sm mb-1">Amazon S3</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Object storage for raw image binaries, OCR documents, and presigned access URLs.
            </p>
          </div>

          <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/80">
            <div className="font-semibold text-emerald-400 text-sm mb-1">Amazon DynamoDB</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Low-latency NoSQL database indexing image metadata, confidence scores, and Rekognition tags.
            </p>
          </div>

          <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/80">
            <div className="font-semibold text-blue-400 text-sm mb-1">Amazon Rekognition</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Computer vision AI service running automated label detection, facial analysis, and OCR text extraction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
