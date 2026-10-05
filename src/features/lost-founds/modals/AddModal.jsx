import { useState } from "react";
import { useDispatch } from "react-redux";
import { IconX } from "@tabler/icons-react";
import useInput from "../../../hooks/useInput";
import { asyncSetIsLostFoundAdd } from "../states/action";
import { showWarningDialog } from "../../../helpers/toolsHelper";

function AddModal({ open, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const [title, onTitleChange, setTitle] = useInput("");
  const [description, onDescriptionChange, setDescription] = useInput("");
  const [status, onStatusChange, setStatus] = useInput("lost");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim() || !description.trim()) {
      showWarningDialog("Judul dan deskripsi wajib diisi.");
      return;
    }

    setLoading(true);
    const ok = await dispatch(
      asyncSetIsLostFoundAdd({ title, description, status })
    );
    setLoading(false);

    if (ok) {
      setTitle("");
      setDescription("");
      setStatus("lost");
      onClose();
      if (onSuccess) onSuccess();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-label="Tambah Laporan"
        className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Tambah Laporan</h2>
          <button type="button" aria-label="Tutup" onClick={onClose}>
            <IconX size={20} />
          </button>
        </div>
        <div>
          <label htmlFor="add-title" className="mb-1 block text-sm font-medium">
            Judul
          </label>
          <input
            id="add-title"
            value={title}
            onChange={onTitleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="add-description" className="mb-1 block text-sm font-medium">
            Deskripsi
          </label>
          <textarea
            id="add-description"
            rows={4}
            value={description}
            onChange={onDescriptionChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="add-status" className="mb-1 block text-sm font-medium">
            Jenis Laporan
          </label>
          <select
            id="add-status"
            value={status}
            onChange={onStatusChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="lost">Barang Hilang</option>
            <option value="found">Barang Ditemukan</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </div>
  );
}

export default AddModal;
