// store/useAuthStore.ts
import { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { supabase } from "../utils/supabase";

interface AuthState {
  user: User | null;
  session: Session | null;
  ready: boolean;
  init: () => () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  ready: false,

  init: () => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, ready: true });
    });
    // return the unsubscribe function
    return () => subscription.unsubscribe();
  },
}));

export default useAuthStore;
