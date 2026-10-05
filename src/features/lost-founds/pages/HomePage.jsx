import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { asyncSetLostFoundStats, asyncSetLostFounds } from "../states/action";
import { formatDate } from "../../../helpers/toolsHelper";
import AddModal from "../modals/AddModal";

const STATUS_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "lost", label: "Hilang" },
  { value: "found", label: "Ditemukan" },
];

const COMPLETED_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "1", label: "Selesai" },
  { value: "0", label: "Belum" },
];

export function normalizeStats(data) {
  if (!data) return [];
  const list = Array.isArray(data)
    ? data
    : Object.values(data).find((value) => Array.isArray(value)) || [];
  return list.map((item, index) => ({
    label: String(item.date || item.month || item.label || index + 1),
    value: Number(item.total ?? item.count ?? item.value ?? 0),
  }));
}

function StatList({ title, items }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="mb-3 font-semibold">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-slate-600">Belum ada data.</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {items.map((item) => (
            <li key={item.label} className="flex justify-between">
              <span>{item.label}</span>
              <span className="font-semibold">{item.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function HomePage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const lostFounds = useSelector((state) => state.lostFounds);
  const isLoading = useSelector((state) => state.isLostFound);
  const stats = useSelector((state) => state.lostFoundStats);
  const [status, setStatus] = useState("");
  const [completed, setCompleted] = useState("");
  const [onlyMe, setOnlyMe] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const showStats = searchParams.get("view") === "stats";

  const load = useCallback(() => {
    dispatch(
      asyncSetLostFounds({
        status,
        is_completed: completed,
        is_me: onlyMe ? 1 : "",
      })
    );
  }, [dispatch, status, completed, onlyMe]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (showStats) {
      dispatch(asyncSetLostFoundStats());
    }
  }, [dispatch, showStats]);

  const visible = useMemo(() => {
    const key = keyword.trim().toLowerCase();
    if (!key) return lostFounds;
    return lostFounds.filter(
      (item) =>
        item.title.toLowerCase().includes(key) ||
        item.description.toLowerCase().includes(key)
    );
  }, [lostFounds, keyword]);

  const metrics = [
    { label: "Total", value: lostFounds.length },
    {
      label: "Barang Hilang",
      value: lostFounds.filter((i) => i.status === "lost").length,
    },
    {
      label: "Barang Ditemukan",
      value: lostFounds.filter((i) => i.status === "found").length,
    },
    {
      label: "Selesai",
      value: lostFounds.filter((i) => Boolean(i.is_completed)).length,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          {showStats ? "Statistik" : "Laporan Lost & Founds"}
        </h1>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
        >
          <IconPlus size={18} /> Tambah Laporan
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <p className="text-sm text-slate-600">{metric.label}</p>
            <p data-testid={`metric-${metric.label}`} className="text-2xl font-extrabold">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {showStats && (
        <div className="grid gap-3 md:grid-cols-2">
          <StatList title="Statistik Harian" items={normalizeStats(stats && stats.daily)} />
          <StatList title="Statistik Bulanan" items={normalizeStats(stats && stats.monthly)} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="relative min-w-[200px] flex-1">
          <IconSearch size={16} className="absolute left-3 top-3 text-slate-600" />
          <input
            aria-label="Cari laporan"
            placeholder="Cari judul atau deskripsi..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3"
          />
        </div>
        <select
          aria-label="Filter status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter penyelesaian"
          value={completed}
          onChange={(e) => setCompleted(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          {COMPLETED_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <label htmlFor="only-me" className="flex items-center gap-2 text-sm">
          <input
            id="only-me"
            type="checkbox"
            checked={onlyMe}
            onChange={(e) => setOnlyMe(e.target.checked)}
          />
          Laporan saya
        </label>
      </div>

      {isLoading ? (
        <p className="text-slate-600">Memuat data...</p>
      ) : visible.length === 0 ? (
        <p className="text-slate-600">Tidak ada laporan.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((item) => (
            <Link
              key={item.id}
              to={`/lost-founds/${item.id}`}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-md"
            >
              <div className="p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
                  <span
                    className={`rounded-full px-2 py-0.5 ${
                      item.status === "lost"
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {item.status === "lost" ? "Hilang" : "Ditemukan"}
                  </span>
                  {Boolean(item.is_completed) && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                      Selesai
                    </span>
                  )}
                </div>
                <h2 className="font-bold">{item.title}</h2>
                <p className="line-clamp-2 text-sm text-slate-600">
                  {item.description}
                </p>
                <p className="mt-2 text-xs text-slate-600">
                  {formatDate(item.created_at)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <AddModal open={addOpen} onClose={() => setAddOpen(false)} onSuccess={load} />
    </div>
  );
}

export default HomePage;
