import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import useInput from "./useInput";

describe("useInput", () => {
  it("nilai awal default string kosong", () => {
    const { result } = renderHook(() => useInput());
    expect(result.current[0]).toBe("");
  });

  it("mengubah nilai dari input teks", () => {
    const { result } = renderHook(() => useInput("a"));
    expect(result.current[0]).toBe("a");
    act(() => {
      result.current[1]({ target: { type: "text", value: "halo" } });
    });
    expect(result.current[0]).toBe("halo");
  });

  it("mengubah nilai dari checkbox", () => {
    const { result } = renderHook(() => useInput(false));
    act(() => {
      result.current[1]({ target: { type: "checkbox", checked: true } });
    });
    expect(result.current[0]).toBe(true);
  });

  it("setValue manual", () => {
    const { result } = renderHook(() => useInput("x"));
    act(() => result.current[2]("y"));
    expect(result.current[0]).toBe("y");
  });
});
