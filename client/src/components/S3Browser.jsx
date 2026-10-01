import React, { useState, useEffect } from 'react';
import { HardDrive, RefreshCw, Trash2, ExternalLink, File, FileImage, ShieldCheck } from 'lucide-react';

export default function S3Browser() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingKey, setDeletingKey] = useState(null);
  const [error, setError] = useState(null);

  const fetchS3Files = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/s3/files');
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || 'Failed to list S3 files');
      setFiles(data.files || []);
    } catch (err) {
      console.error('Error fetching S3 files:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchS3Files();
  }, []);

  const handleDelete = async (key) => {
    if (!confirm(`Are you sure you want to delete '${key}' from AWS S3?`)) return;

    setDeletingKey(key);
    try {
      const res = await fetch(`/api/s3/files/${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete object from S3');
      fetchS3Files();
    } catch (err) {
      alert(`Error deleting file: ${err.message}`);
    } finally {
      setDeletingKey(null);
    }
  };

  const totalSize = files.reduce((acc, f) => acc + (f.Size || 0), 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-800 gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-lg">Amazon S3 Object Browser</h3>
            <p className="text-xs text-slate-400">Manage media binaries & document assets in cloud storage</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchS3Files}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center space-x-1.5 transition-colors border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Bucket</span>
          </button>
        </div>
      </div>

      {/* S3 Storage Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-500 font-medium block">Total S3 Objects</span>
          <span className="text-2xl font-bold text-amber-400 mt-1 block">{files.length}</span>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-500 font-medium block">Total Storage Used</span>
          <span className="text-2xl font-bold text-slate-100 mt-1 block">
            {(totalSize / (1024 * 1024)).toFixed(2)} MB
          </span>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-500 font-medium block">S3 Bucket Access</span>
          <span className="text-sm font-semibold text-emerald-400 mt-2 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Encrypted & Public CORS Enabled</span>
          </span>
        </div>
      </div>

      {/* S3 Files Table */}
      {error && (
        <div className="p-4 bg-red-950/30 border border-red-800/50 rounded-lg text-xs text-red-400 mb-4">
          Failed to load S3 objects: {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mb-2" />
          <p className="text-sm">Querying Amazon S3 Bucket Objects...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-xl text-slate-500">
          <HardDrive className="w-8 h-8 text-slate-700 mx-auto mb-2" />
          <p className="text-sm font-medium">No objects in S3 Bucket</p>
          <p className="text-xs text-slate-600 mt-1">Upload files from the "Upload & Analyze" tab to populate S3.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">Object Key / File Name</th>
                <th className="p-3.5">Size</th>
                <th className="p-3.5">Last Modified</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {files.map((file, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-medium flex items-center space-x-2.5">
                    {file.Key.endsWith('.jpg') || file.Key.endsWith('.png') || file.Key.endsWith('.jpeg') ? (
                      <FileImage className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    ) : (
                      <File className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    )}
                    <div className="overflow-hidden">
                      <span className="font-mono text-slate-200 block truncate max-w-md">{file.FileName || file.Key}</span>
                      <span className="text-[10px] text-slate-500 font-mono truncate block">{file.Key}</span>
                    </div>
                  </td>

                  <td className="p-3.5 font-mono text-slate-400">
                    {file.Size ? `${(file.Size / 1024).toFixed(1)} KB` : 'N/A'}
                  </td>

                  <td className="p-3.5 text-slate-400">
                    {file.LastModified ? new Date(file.LastModified).toLocaleString() : 'N/A'}
                  </td>

                  <td className="p-3.5 text-right space-x-2">
                    <a
                      href={file.Url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                      title="Open Object in New Tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => handleDelete(file.Key)}
                      disabled={deletingKey === file.Key}
                      className="inline-flex items-center space-x-1 p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/60 rounded transition-colors"
                      title="Delete Object from S3"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
