import React, { useState } from 'react';
import { Upload, Eye, FileText, CheckCircle, Cpu, HardDrive, Database, AlertCircle } from 'lucide-react';

export default function UploadVision({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to analyze image');
      }

      setResult(data);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload Form */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-lg">Upload Media to AWS</h3>
                <p className="text-xs text-slate-400">Trigger Rekognition, S3 Bucket & DynamoDB</p>
              </div>
            </div>

            <form onSubmit={handleAnalyze} className="space-y-4">
              <label className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 transition-colors rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-950/50 group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-800">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs text-white bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-700">Change File</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-amber-500/10 group-hover:text-amber-500 text-slate-400 transition-all flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-300">Click or drag image file here</p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG, JPEG up to 10MB</p>
                  </div>
                )}
              </label>

              {file && (
                <div className="flex items-center justify-between text-xs bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
                  <span className="truncate text-slate-300 max-w-[200px]">{file.name}</span>
                  <span className="text-slate-400 font-mono">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!file || loading}
                className={`w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center space-x-2 transition-all shadow-lg ${
                  !file || loading
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 font-semibold'
                }`}
              >
                {loading ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin" />
                    <span>Processing AWS Rekognition...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    <span>Run AWS Vision & Index</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-950/40 border border-red-800/60 rounded-xl flex items-start space-x-3 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Analysis Failed</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AWS Rekognition Results */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-lg">AWS Vision Intelligence Output</h3>
                <p className="text-xs text-slate-400">AWS Rekognition Labels, Confidence Scores & OCR</p>
              </div>
            </div>

            {result && (
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded-full flex items-center space-x-1.5 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>AWS Pipeline Completed</span>
              </span>
            )}
          </div>

          {result ? (
            <div className="space-y-5">
              {/* Record Category & Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Category</span>
                  <span className="text-sm font-semibold text-amber-400 mt-0.5 block">{result.record.category}</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Confidence Avg</span>
                  <span className="text-sm font-semibold text-emerald-400 mt-0.5 block">{result.record.confidenceAverage}%</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">DynamoDB ID</span>
                  <span className="text-xs font-mono text-slate-300 mt-1 block truncate" title={result.record.id}>{result.record.id}</span>
                </div>
              </div>

              {/* Rekognition Detected Labels */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Detected Object Labels</span>
                  <span className="text-slate-500">{result.record.labels?.length || 0} items</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.record.labels?.map((label, idx) => (
                    <div key={idx} className="bg-slate-950/40 border border-slate-800/80 p-2.5 rounded-lg flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-200">{label.Name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full"
                            style={{ width: `${label.Confidence}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-amber-400">{label.Confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detected Text / OCR */}
              {result.record.detectedTexts && result.record.detectedTexts.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>OCR Text Detection</span>
                  </h4>
                  <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-lg font-mono text-xs text-slate-300 space-y-1 max-h-36 overflow-y-auto">
                    {result.record.detectedTexts.map((text, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <span className="text-slate-600 select-none">{idx + 1}.</span>
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AWS Storage Integration Cards */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-950/50 border border-slate-800 p-3 rounded-lg flex items-center space-x-3">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-md">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-slate-500 uppercase block">Amazon S3 Object</span>
                    <span className="text-xs font-mono text-slate-300 truncate block">{result.record.s3Key}</span>
                  </div>
                </div>

                <div className="bg-slate-950/50 border border-slate-800 p-3 rounded-lg flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-md">
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-slate-500 uppercase block">Amazon DynamoDB</span>
                    <span className="text-xs font-mono text-emerald-400 truncate block">Indexed Successfully</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 border-2 border-dashed border-slate-800/80 rounded-xl flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Cpu className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-sm font-medium text-slate-400">No Image Processed Yet</p>
              <p className="text-xs text-slate-600 mt-1 max-w-sm">
                Upload an image on the left panel to execute AWS Rekognition vision detection and auto-store in S3 & DynamoDB.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
