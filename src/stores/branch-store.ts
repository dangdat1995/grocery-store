import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BranchInfo {
  id: string;
  name: string;
  address: string;
  district: string | null;
  city: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  delivery_radius_km: number;
  opening_time: string;
  closing_time: string;
  is_main: boolean;
}

interface BranchState {
  selectedBranch: BranchInfo | null;
  branches: BranchInfo[];
  setBranches: (branches: BranchInfo[]) => void;
  selectBranch: (branch: BranchInfo) => void;
  getSelectedId: () => string | null;
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set, get) => ({
      selectedBranch: null,
      branches: [],

      setBranches: (branches) => {
        set({ branches });
        // Auto-select main branch if none selected
        if (!get().selectedBranch && branches.length > 0) {
          const main = branches.find((b) => b.is_main) || branches[0];
          set({ selectedBranch: main });
        }
      },

      selectBranch: (branch) => set({ selectedBranch: branch }),

      getSelectedId: () => get().selectedBranch?.id || null,
    }),
    { name: "branch-store" }
  )
);
