import { createFileRoute } from "@tanstack/react-router";
import { CommunityCare } from "@/components/mydoctor/community-care";
import { Shell } from "@/components/mydoctor/shell";

export const Route = createFileRoute("/community-care")({
  component: function CommunityCarePage() {
    return (
      <Shell wide>
        <CommunityCare />
      </Shell>
    );
  },
});
