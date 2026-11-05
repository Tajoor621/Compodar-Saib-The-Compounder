import { createFileRoute } from "@tanstack/react-router";
import { CaseScreen } from "@/components/mydoctor/case-screen";
import { Shell } from "@/components/mydoctor/shell";

export const Route = createFileRoute("/case/$caseId")({
  component: CasePage,
});

function CasePage() {
  const { caseId } = Route.useParams();
  return (
    <Shell>
      <CaseScreen caseId={caseId} />
    </Shell>
  );
}
