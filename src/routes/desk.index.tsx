import { createFileRoute } from "@tanstack/react-router";
import { DeskList } from "@/components/mydoctor/desk-screen";

export const Route = createFileRoute("/desk/")({ component: DeskIndex });

function DeskIndex() {
  return <DeskList />;
}
