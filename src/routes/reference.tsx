import { createFileRoute } from "@tanstack/react-router";
import { ReferenceScreen } from "@/components/mydoctor/reference-screen";
import { Shell } from "@/components/mydoctor/shell";

export const Route = createFileRoute("/reference")({
  component: function ReferencePage() {
    return (
      <Shell wide>
        <ReferenceScreen />
      </Shell>
    );
  },
});
