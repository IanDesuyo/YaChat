export interface IStorage {
  recents: RecentLesson[];
  setRecents: (recent: RecentLesson, isRemove: boolean) => void;
}

export interface RecentLesson {
  _id: string;
  name: string;
  courseName: string;
  lastVisitAt?: Date;
}
