import { useCallback, useState } from "react";

/**
 * Custom hook two-way data binding untuk elemen formulir.
 * Mengembalikan [value, onChange, setValue].
 */
export default function useInput(defaultValue = "") {
  const [value, setValue] = useState(defaultValue);

  const onChange = useCallback((event) => {
    const target = event.target;
    setValue(target.type === "checkbox" ? target.checked : target.value);
  }, []);

  return [value, onChange, setValue];
}
