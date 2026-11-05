import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Shell } from "@/components/mydoctor/shell";

export const Route = createFileRoute("/desk")({ component: DeskLayout });

function DeskLayout() {
  return (
    <Shell wide>
      <Outlet />
    </Shell>
  );
}
