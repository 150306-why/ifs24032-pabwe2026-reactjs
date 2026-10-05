import { useState } from "react";
import { useDispatch } from "react-redux";
import { IconX } from "@tabler/icons-react";
import useInput from "../../../hooks/useInput";
import { asyncSetIsLostFoundChange } from "../states/action";
import { showWarningDialog } from "../../../helpers/toolsHelper";

function ChangeModal({ open, lostFound, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const [title, onTitleChange] = useInput(lostFound ? lostFound.title : "");
  const [description, onDescriptionChange] = useInput(
    lostFound ? lostFound.description : ""
  );
  const [status, onStatusChange] = useInput(
    lostFound ? lostFound.status : "lost"
  );
  const [isCompleted, onCompletedChange] = useInput(
    lostFound ? Boolean(lostFound.is_completed) : false
  );
  const [loading, setLoading] = useState(false);

  if (!open || !lostFound) return null;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim() || !description.trim()) {
      showWarningDialog("Judul dan deskripsi wajib diisi.");
      return;
    }

    setLoading(true);
    const ok = await dispatch(
      asyncSetIsLostFoundChange(lostFound.id, {
        title,
        description,
        status,
        isCompleted,
      })
    );
    setLoading(false);

    if (ok) {
      onClose();
      if (onSuccess) onSuccess();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-label="Ubah Laporan"
        className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Ubah Laporan</h3>
          <button type="button" aria-label="Tutup" onClick={onClose}>
            <IconX size={20} />
          </button>
        </div>
        <div>
          <label htmlFor="change-title" className="mb-1 block text-sm font-medium">
            Judul
          </label>
          <input
            id="change-title"
            value={title}
            onChange={onTitleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="change-description" className="mb-1 block text-sm font-medium">
            Deskripsi
          </label>
          <textarea
            id="change-description"
            rows={4}
            value={description}
            onChange={onDescriptionChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="change-status" className="mb-1 block text-sm font-medium">
            Jenis Laporan
          </label>
          <select
            id="change-status"
            value={status}
            onChange={onStatusChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="lost">Barang Hilang</option>
            <option value="found">Barang Ditemukan</option>
          </select>
        </div>
        <label htmlFor="change-completed" className="flex items-center gap-2 text-sm font-medium">
          <input
            id="change-completed"
            type="checkbox"
            checked={isCompleted}
            onChange={onCompletedChange}
          />
          Tandai selesai
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
}

export default ChangeModal;
