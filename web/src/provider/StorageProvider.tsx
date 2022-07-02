import { createContext, useCallback, useState } from "react";
import { IStorage, RecentLesson } from "../types/storage";

export const StorageContext = createContext<IStorage>({} as any);

const StorageProvider = ({ children }: { children: React.ReactNode }) => {
  const [recents, _setRecents] = useState<RecentLesson[]>(() => {
    const recents = localStorage.getItem("recents");
    return recents ? JSON.parse(recents) : [];
  });

  const setRecents = useCallback((recent: RecentLesson, isRemove: boolean = false) => {
    _setRecents(prev => {
      const recents = prev.filter(r => r._id !== recent._id);
      if (!isRemove) {
        recents.unshift(recent);
      }

      if (recents.length > 5) {
        recents.pop();
      }

      localStorage.setItem("recents", JSON.stringify(recents));
      console.log("setRecents", recents);
      return recents;
    });
  }, []);

  return <StorageContext.Provider value={{ recents, setRecents }}>{children}</StorageContext.Provider>;
};

export default StorageProvider;
