import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, Search, Trash2, Code, Tag, Layers } from 'lucide-react';

export default function DynamoInspector() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [error, setError] = useState(null);

  const fetchDynamoRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dynamo/records');
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || 'Failed to scan DynamoDB records');
      setRecords(data.records || []);
    } catch (err) {
      console.error('Error fetching DynamoDB records:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDynamoRecords();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm(`Are you sure you want to delete DynamoDB record '${id}'?`)) return;

    try {
      const res = await fetch(`/api/dynamo/records/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete DynamoDB record');
      if (selectedRecord?.id === id) setSelectedRecord(null);
      fetchDynamoRecords();
    } catch (err) {
      alert(`Error deleting record: ${err.message}`);
    }
  };

  const filteredRecords = records.filter((rec) => {
    const q = search.toLowerCase();
    return (
      rec.fileName?.toLowerCase().includes(q) ||
      rec.category?.toLowerCase().includes(q) ||
      rec.id?.toLowerCase().includes(q) ||
      rec.labels?.some((l) => l.Name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-800 gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-lg">Amazon DynamoDB Table Inspector</h3>
              <p className="text-xs text-slate-400">Scan NoSQL key-value items & Rekognition metadata index</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search tags, categories, IDs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <button
              onClick={fetchDynamoRecords}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center space-x-1.5 transition-colors border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Scan Table</span>
            </button>
          </div>
        </div>

        {/* DynamoDB Grid View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Record List */}
          <div className="lg:col-span-7 space-y-3">
            {error && (
              <div className="p-3 bg-red-950/30 border border-red-800/50 rounded-lg text-xs text-red-400">
                DynamoDB Error: {error}
              </div>
            )}

            {loading ? (
              <div className="py-12 text-center text-slate-500 flex flex-col items-center">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mb-2" />
                <p className="text-sm">Scanning Amazon DynamoDB Items...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-xl text-slate-500">
                <Database className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-sm font-medium">No DynamoDB Items Found</p>
              </div>
            ) : (
              filteredRecords.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecord(rec)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedRecord?.id === rec.id
                      ? 'bg-slate-800/80 border-amber-500/50 shadow-lg'
                      : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-200 text-sm">{rec.fileName}</span>
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] rounded border border-amber-500/20 font-medium">
                          {rec.category || 'General'}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-500 mt-1">ID: {rec.id}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(rec.id);
                      }}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors"
                      title="Delete Item from DynamoDB"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Labels Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {rec.labels?.slice(0, 4).map((l, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-900 border border-slate-700/60 rounded text-[10px] text-slate-300 flex items-center space-x-1">
                        <Tag className="w-2.5 h-2.5 text-slate-500" />
                        <span>{l.Name}</span>
                        <span className="text-amber-400 text-[9px]">{l.Confidence}%</span>
                      </span>
                    ))}
                    {rec.labels?.length > 4 && (
                      <span className="px-1.5 py-0.5 bg-slate-900 text-[10px] text-slate-500 rounded">
                        +{rec.labels.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Record JSON Inspector Detail */}
          <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex flex-col h-[500px]">
            <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-slate-800">
              <Code className="w-4 h-4 text-amber-400" />
              <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">DynamoDB Item JSON Attribute Viewer</h4>
            </div>

            {selectedRecord ? (
              <div className="flex-1 overflow-y-auto">
                <pre className="font-mono text-slate-300 text-[11px] leading-relaxed bg-slate-900/90 p-4 rounded-lg border border-slate-800 whitespace-pre-wrap break-all select-all">
                  {JSON.stringify(selectedRecord, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center p-6">
                <Layers className="w-8 h-8 text-slate-700 mb-2" />
                <p className="text-xs">Click any DynamoDB record on the left to inspect its full document JSON attributes.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
