"use client";

import { useEffect, useState } from "react";

interface NetworkInformation {
  saveData?: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

/**
 * Phase 8 brief: "Detect navigator.connection.saveData and honour it."
 * The Network Information API isn't universal (notably absent on
 * Safari/iOS) -- this degrades to `false` (full experience) when it's
 * missing, the safer default: a learner who's never asked can't be made
 * worse off by it, only one who genuinely has data-saver on and isn't
 * detected loses out on the lighter path they asked their OS for.
 */
export function useSaveData(): boolean {
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    if (!connection) return;

    setSaveData(connection.saveData === true);

    const handleChange = () => setSaveData(connection.saveData === true);
    connection.addEventListener?.("change", handleChange);
    return () => connection.removeEventListener?.("change", handleChange);
  }, []);

  return saveData;
}
