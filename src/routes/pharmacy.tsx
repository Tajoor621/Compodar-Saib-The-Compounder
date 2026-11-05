import { createFileRoute } from "@tanstack/react-router";
import { PharmacyScreen } from "@/components/mydoctor/pharmacy-screen";
import { Shell } from "@/components/mydoctor/shell";

export const Route = createFileRoute("/pharmacy")({
  component: function PharmacyPage() {
    return (
      <Shell wide>
        <PharmacyScreen />
      </Shell>
    );
  },
});
