import { createFileRoute } from "@tanstack/react-router";
import { FamilyCare } from "@/components/mydoctor/family-care";
import { Shell } from "@/components/mydoctor/shell";
import { CARE_TRACKS, type CareTrack } from "@/lib/mydoctor/community/family-care";

export const Route = createFileRoute("/family-care")({
  validateSearch: (search: Record<string, unknown>): { track?: CareTrack } => {
    const track = CARE_TRACKS.find((item) => item === search.track);
    return track ? { track } : {};
  },
  component: FamilyCarePage,
});

function FamilyCarePage() {
  const { track = "children" } = Route.useSearch();
  return (
    <Shell wide>
      <FamilyCare key={track} track={track} />
    </Shell>
  );
}
