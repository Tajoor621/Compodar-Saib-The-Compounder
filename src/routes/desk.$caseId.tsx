import { createFileRoute } from "@tanstack/react-router";
import { DeskCase } from "@/components/mydoctor/desk-screen";

export const Route = createFileRoute("/desk/$caseId")({
  component: DeskCasePage,
});

function DeskCasePage() {
  const { caseId } = Route.useParams();
  return <DeskCase caseId={caseId} />;
}
