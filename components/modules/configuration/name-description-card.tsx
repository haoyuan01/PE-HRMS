"use client";

import { Pencil, Trash2 } from "lucide-react";
import { RecordCard } from "@/components/common/record-card";

interface NameDescriptionCardProps {
  name: string;
  description: string | null;
  /** Lowercase singular, for the button tooltips: "position", "movement type". */
  entityLabel: string;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * Mobile stand-in for one row of the name + description configuration tables
 * (position, department, movement type), which are identical in shape. See
 * RESPONSIVE.md. No field tiles: the description is prose, so it sits directly
 * on the card rather than in a single-line tile.
 */
export function NameDescriptionCard({
  name,
  description,
  entityLabel,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: NameDescriptionCardProps) {
  return (
    <RecordCard
      title={<p className="truncate font-medium text-on-surface">{name}</p>}
      action={
        canEdit || canDelete ? (
          <>
            {canEdit && (
              <button
                onClick={onEdit}
                className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                title={`Edit ${entityLabel}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={onDelete}
                className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-ds-error/10 hover:text-ds-error"
                title={`Delete ${entityLabel}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </>
        ) : undefined
      }
    >
      <p className="line-clamp-2 break-words text-xs text-on-surface-variant">
        {description || "—"}
      </p>
    </RecordCard>
  );
}
