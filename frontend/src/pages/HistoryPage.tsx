import { useEffect, useState, useMemo } from 'react';
import { History, Search, Video, Image, Camera, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { getDetectionHistory } from '@/services/api';
import { formatTime, getComplianceStatus } from '@/lib/utils';
import type { DetectionRecord, InputType, ComplianceStatus } from '@/types';

const PAGE_SIZE = 10;

export function HistoryPage() {
  const [history, setHistory] = useState<DetectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<InputType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ComplianceStatus | 'all'>('all');
  const [page, setPage] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getDetectionHistory();
        if (mounted) setHistory(data);
      } catch {
        // Backend not connected
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    return history.filter((r) => {
      if (typeFilter !== 'all' && r.inputType !== typeFilter) return false;
      if (statusFilter !== 'all' && getComplianceStatus(r.compliance) !== statusFilter) return false;
      if (search && !r.timestamp.includes(search) && !r.id.includes(search)) return false;
      return true;
    });
  }, [history, search, typeFilter, statusFilter]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const inputTypeIcon = (type: InputType) => {
    switch (type) {
      case 'webcam': return Camera;
      case 'image': return Image;
      case 'video': return Video;
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Detection History"
        subtitle="Complete log of all detection sessions"
        icon={History}
      />

      {/* Filters */}
      <div className="card-base p-4 mb-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search by timestamp or ID…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ink-50 border border-ink-200/60 text-sm text-ink-700 placeholder-ink-400 focus:outline-none focus:border-primary-300 focus:bg-white focus:ring-2 focus:ring-primary-500/10 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <FilterGroup
              icon={SlidersHorizontal}
              label="Type"
              value={typeFilter}
              options={[
                { key: 'all', label: 'All' },
                { key: 'webcam', label: 'Webcam' },
                { key: 'image', label: 'Image' },
                { key: 'video', label: 'Video' },
              ]}
              onChange={(v) => { setTypeFilter(v as InputType | 'all'); setPage(0); }}
            />
            <FilterGroup
              label="Status"
              value={statusFilter}
              options={[
                { key: 'all', label: 'All' },
                { key: 'safe', label: 'Safe' },
                { key: 'warning', label: 'Warning' },
                { key: 'danger', label: 'Danger' },
              ]}
              onChange={(v) => { setStatusFilter(v as ComplianceStatus | 'all'); setPage(0); }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-ink-50" />
            ))}
          </div>
        ) : pageData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-ink-50 flex items-center justify-center mb-4">
              <History size={28} className="text-ink-300" />
            </div>
            <p className="text-sm font-medium text-ink-500">No detection records found</p>
            <p className="text-xs text-ink-400 mt-1">Run detections to populate history</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-xs uppercase tracking-wider text-ink-400 bg-ink-50/50">
                    <th className="text-left font-semibold px-5 py-3">Timestamp</th>
                    <th className="text-left font-semibold px-5 py-3">Input Type</th>
                    <th className="text-center font-semibold px-5 py-3">People</th>
                    <th className="text-center font-semibold px-5 py-3">Helmet</th>
                    <th className="text-center font-semibold px-5 py-3">No Helmet</th>
                    <th className="text-center font-semibold px-5 py-3">Compliance</th>
                    <th className="text-right font-semibold px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((r) => {
                    const Icon = inputTypeIcon(r.inputType);
                    return (
                      <tr
                        key={r.id}
                        className="border-b border-ink-100/60 hover:bg-ink-50/50 transition-colors"
                      >
                        <td className="px-5 py-3.5 text-ink-600 whitespace-nowrap font-medium">{formatTime(r.timestamp)}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2 text-ink-500 capitalize">
                            <span className="w-7 h-7 rounded-lg bg-ink-50 flex items-center justify-center">
                              <Icon size={14} className="text-ink-400" />
                            </span>
                            {r.inputType}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="font-mono font-semibold text-ink-700">{r.helmetCount + r.noHelmetCount}</span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="font-mono font-semibold text-success-600">{r.helmetCount}</span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="font-mono font-semibold text-error-600">{r.noHelmetCount}</span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  getComplianceStatus(r.compliance) === 'safe' ? 'bg-success-500' :
                                  getComplianceStatus(r.compliance) === 'warning' ? 'bg-warning-500' : 'bg-error-500'
                                }`}
                                style={{ width: `${r.compliance}%` }}
                              />
                            </div>
                            <span className="font-mono text-ink-600 text-xs">{r.compliance.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <StatusBadge status={getComplianceStatus(r.compliance)} size="sm" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filtered.length > PAGE_SIZE && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-ink-100">
                <span className="text-xs text-ink-400">
                  Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="p-1.5 rounded-lg bg-ink-50 hover:bg-ink-100 disabled:opacity-30 disabled:cursor-not-allowed text-ink-500 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs text-ink-500 font-mono">{page + 1} / {pageCount}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                    disabled={page >= pageCount - 1}
                    className="p-1.5 rounded-lg bg-ink-50 hover:bg-ink-100 disabled:opacity-30 disabled:cursor-not-allowed text-ink-500 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FilterGroup({
  icon: Icon,
  label,
  value,
  options,
  onChange,
}: {
  icon?: typeof SlidersHorizontal;
  label: string;
  value: string;
  options: { key: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-ink-50 rounded-xl p-0.5">
      {Icon && <Icon size={13} className="ml-2 text-ink-400" />}
      <span className="text-[10px] font-semibold text-ink-400 uppercase tracking-wider px-1.5 hidden sm:block">{label}</span>
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            value === opt.key
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-ink-400 hover:text-ink-600'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
