import { createFileRoute } from "@tanstack/react-router";
import { DrugInfoScreen } from "@/components/mydoctor/drug-info-screen";
import { Shell } from "@/components/mydoctor/shell";

export const Route = createFileRoute("/drug-info")({
  component: function DrugInfoPage() {
    return (
      <Shell wide>
        <DrugInfoScreen />
      </Shell>
    );
  },
});
