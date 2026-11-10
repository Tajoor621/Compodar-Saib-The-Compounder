import { createFileRoute } from "@tanstack/react-router";
import { DesksScreen } from "@/components/mydoctor/desks-screen";
import { Shell } from "@/components/mydoctor/shell";

export const Route = createFileRoute("/desks")({
  component: function DesksPage() {
    return (
      <Shell wide>
        <DesksScreen />
      </Shell>
    );
  },
});
