import { AnnouncementList } from "@/components/modules/announcements/announcement-list";

export default function AnnouncementPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-on-surface">
          Announcement
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Create and manage company announcements.
        </p>
      </div>

      <AnnouncementList />
    </div>
  );
}
