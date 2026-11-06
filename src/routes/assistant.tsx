import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/mydoctor/shell";
import { AssistantScreen } from "@/components/mydoctor/assistant-screen";

export const Route = createFileRoute("/assistant")({
  component: AssistantPage,
});

function AssistantPage() {
  return (
    <Shell wide>
      <AssistantScreen />
    </Shell>
  );
}
