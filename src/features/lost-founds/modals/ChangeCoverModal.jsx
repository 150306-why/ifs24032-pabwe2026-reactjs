import { useState } from "react";
import { useDispatch } from "react-redux";
import { IconX } from "@tabler/icons-react";
import { asyncSetIsLostFoundChangeCover } from "../states/action";
import { showWarningDialog } from "../../../helpers/toolsHelper";

function ChangeCoverModal({ open, lostFoundId, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  function handleFileChange(event) {
    const selected = event.target.files[0];
    if (!selected) {
      setFile(null);
      setPreview(null);
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      showWarningDialog("Pilih gambar terlebih dahulu.");
      return;
    }

    setLoading(true);
    const ok = await dispatch(
      asyncSetIsLostFoundChangeCover(lostFoundId, file)
    );
    setLoading(false);

    if (ok) {
      setFile(null);
      setPreview(null);
      onClose();
      if (onSuccess) onSuccess();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-label="Ubah Cover"
        className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Ubah Cover</h2>
          <button type="button" aria-label="Tutup" onClick={onClose}>
            <IconX size={20} />
          </button>
        </div>
        {preview && (
          <img
            src={preview}
            alt="Pratinjau cover"
            className="max-h-60 w-full rounded-lg object-cover"
          />
        )}
        <div>
          <label htmlFor="cover-file" className="mb-1 block text-sm font-medium">
            Gambar Cover
          </label>
          <input
            id="cover-file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Mengunggah..." : "Unggah"}
        </button>
      </form>
    </div>
  );
}

export default ChangeCoverModal;
