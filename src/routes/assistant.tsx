import { createFileRoute } from "@tanstack/react-router";
import { isStaticPages } from "@/lib/static-pages";
import { ReferenceScreen } from "@/components/mydoctor/reference-screen";
import { Shell } from "@/components/mydoctor/shell";
import { AssistantScreen } from "@/components/mydoctor/assistant-screen";

export const Route = createFileRoute("/assistant")({
  component: AssistantPage,
});

function AssistantPage() {
  return (
    <Shell wide>
      {isStaticPages() ? <ReferenceScreen /> : <AssistantScreen />}
    </Shell>
  );
}
