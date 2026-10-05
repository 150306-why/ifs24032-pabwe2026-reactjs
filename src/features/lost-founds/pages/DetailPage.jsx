import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IconEdit, IconPhoto, IconTrash } from "@tabler/icons-react";
import {
  asyncSetIsLostFoundDelete,
  asyncSetLostFound,
} from "../states/action";
import { formatDate } from "../../../helpers/toolsHelper";
import ChangeModal from "../modals/ChangeModal";
import ChangeCoverModal from "../modals/ChangeCoverModal";

function DetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const lostFound = useSelector((state) => state.lostFound);
  const isLoading = useSelector((state) => state.isLostFound);
  const [changeOpen, setChangeOpen] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);

  useEffect(() => {
    dispatch(asyncSetLostFound(id));
  }, [dispatch, id]);

  function reload() {
    dispatch(asyncSetLostFound(id));
  }

  async function handleDelete() {
    const ok = await dispatch(asyncSetIsLostFoundDelete(id));
    if (ok) {
      navigate("/");
    }
  }

  if (isLoading) {
    return <p className="text-slate-500">Memuat data...</p>;
  }

  if (!lostFound) {
    return (
      <div className="space-y-3">
        <p className="text-slate-500">Laporan tidak ditemukan.</p>
        <Link to="/" className="font-semibold text-indigo-600">
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      {lostFound.cover ? (
        <img
          src={lostFound.cover}
          alt={lostFound.title}
          className="max-h-96 w-full rounded-xl object-contain bg-slate-100"
        />
      ) : (
        <div className="flex h-48 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
          Tidak ada foto
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span
          className={`rounded-full px-2 py-0.5 ${
            lostFound.status === "lost"
              ? "bg-red-100 text-red-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {lostFound.status === "lost" ? "Hilang" : "Ditemukan"}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
          {lostFound.is_completed ? "Selesai" : "Belum selesai"}
        </span>
      </div>

      <h1 className="text-2xl font-bold">{lostFound.title}</h1>
      <p className="text-sm text-slate-500">
        Dilaporkan oleh{" "}
        <span className="font-semibold">
          {lostFound.user ? lostFound.user.name : "-"}
        </span>{" "}
        pada {formatDate(lostFound.created_at)}
      </p>
      <p className="whitespace-pre-line text-slate-700">
        {lostFound.description}
      </p>

      <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => setCoverOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
        >
          <IconPhoto size={16} /> Ubah Cover
        </button>
        <button
          type="button"
          onClick={() => setChangeOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
        >
          <IconEdit size={16} /> Ubah Data
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          <IconTrash size={16} /> Hapus
        </button>
      </div>

      <ChangeModal
        key={`${lostFound.id}-${lostFound.updated_at}`}
        open={changeOpen}
        lostFound={lostFound}
        onClose={() => setChangeOpen(false)}
        onSuccess={reload}
      />
      <ChangeCoverModal
        open={coverOpen}
        lostFoundId={lostFound.id}
        onClose={() => setCoverOpen(false)}
        onSuccess={reload}
      />
    </article>
  );
}

export default DetailPage;
