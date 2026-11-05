import { createFileRoute } from "@tanstack/react-router";
import { IntakeFlow } from "@/components/mydoctor/intake-flow";
import { Shell } from "@/components/mydoctor/shell";

export const Route = createFileRoute("/intake")({ component: IntakePage });

function IntakePage() {
  return (
    <Shell>
      <IntakeFlow />
    </Shell>
  );
}
