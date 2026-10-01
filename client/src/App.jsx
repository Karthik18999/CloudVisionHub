import React, { useState, useEffect } from 'react';
import { Cloud, Upload, HardDrive, Database, Settings, ShieldCheck, Server, Sparkles } from 'lucide-react';
import UploadVision from './components/UploadVision';
import S3Browser from './components/S3Browser';
import DynamoInspector from './components/DynamoInspector';
import AwsConfigPanel from './components/AwsConfigPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [health, setHealth] = useState(null);

  const fetchHealth = () => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch((err) => console.error('Health check failed:', err));
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header Navigation */}
      <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Cloud className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-slate-100 text-lg tracking-tight">CloudVision Hub</h1>
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-semibold rounded border border-amber-500/20 uppercase tracking-wider">
                  AWS AI & Cloud
                </span>
              </div>
              <p className="text-xs text-slate-400">AWS Rekognition • S3 Bucket • DynamoDB Table</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'upload'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Vision AI & Upload</span>
            </button>

            <button
              onClick={() => setActiveTab('s3')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 's3'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>S3 Browser</span>
            </button>

            <button
              onClick={() => setActiveTab('dynamo')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dynamo'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>DynamoDB Table</span>
            </button>

            <button
              onClick={() => setActiveTab('config')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'config'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>AWS Config</span>
            </button>
          </nav>

          {/* AWS Mode Indicator */}
          <div className="flex items-center space-x-2 text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">{health?.awsMode || 'AWS Active'}</span>
          </div>
        </div>
      </header>

      {/* Mobile Tab bar */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-2 flex overflow-x-auto space-x-1">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${
            activeTab === 'upload' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload</span>
        </button>
        <button
          onClick={() => setActiveTab('s3')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${
            activeTab === 's3' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>S3 Storage</span>
        </button>
        <button
          onClick={() => setActiveTab('dynamo')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${
            activeTab === 'dynamo' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>DynamoDB</span>
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${
            activeTab === 'config' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>AWS Setup</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' && <UploadVision onUploadSuccess={fetchHealth} />}
        {activeTab === 's3' && <S3Browser />}
        {activeTab === 'dynamo' && <DynamoInspector />}
        {activeTab === 'config' && <AwsConfigPanel />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>CloudVision Hub — Powered by Amazon Web Services</span>
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span>S3: {health?.s3Bucket}</span>
            <span>DynamoDB: {health?.dynamoTable}</span>
            <span>Region: {health?.awsRegion}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
