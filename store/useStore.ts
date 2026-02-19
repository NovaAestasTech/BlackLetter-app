import { create } from "zustand";

interface AppState {
  pdfText: string;
  pdfName: string;
  loading: boolean;
  pdfDescription: string;
  fetchPdfData: (filename: string) => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
  pdfText: "",
  pdfName: "",
  pdfDescription: "",
  loading: false,

  fetchPdfData: async (filename: string) => {
    set({ loading: true });
    try {
      const res = await fetch(
        `/api/pdf-content?filename=${encodeURIComponent(filename)}`,
      );

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();
      set({
        pdfText: data.text,
        pdfName: data.name,
        pdfDescription: data.description,
        loading: false,
      });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },
}));
