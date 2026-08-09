import { MovementCalendar } from "@/components/modules/movement/movement-calendar";
import { MovementList } from "@/components/modules/movement/movement-list";

export default function StaffMovementPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-on-surface">
          Staff Movement
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Track staff transfers, relocations, and movement history.
        </p>
      </div>

      {/* Calendar summary of movements per day */}
      <MovementCalendar />

      {/* Movement list with search + filters + pagination */}
      <MovementList />
    </div>
  );
}
