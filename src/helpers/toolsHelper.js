// sweetalert2 dimuat lazy agar tidak membebani bundle awal (Reduce unused JavaScript)
async function getSwal() {
  const module = await import("sweetalert2");
  return module.default;
}

export async function showSuccessDialog(message) {
  const Swal = await getSwal();
  return Swal.fire({
    icon: "success",
    title: "Berhasil",
    text: message,
    confirmButtonColor: "#4f46e5",
  });
}

export async function showErrorDialog(message) {
  const Swal = await getSwal();
  return Swal.fire({
    icon: "error",
    title: "Gagal",
    text: message,
    confirmButtonColor: "#4f46e5",
  });
}

export async function showWarningDialog(message) {
  const Swal = await getSwal();
  return Swal.fire({
    icon: "warning",
    title: "Perhatian",
    text: message,
    confirmButtonColor: "#4f46e5",
  });
}

export async function showConfirmDialog(
  message,
  confirmText = "Ya, lanjutkan"
) {
  const Swal = await getSwal();
  const result = await Swal.fire({
    icon: "question",
    title: "Konfirmasi",
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
    confirmButtonColor: "#4f46e5",
    cancelButtonColor: "#94a3b8",
  });
  return result.isConfirmed;
}

export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}
