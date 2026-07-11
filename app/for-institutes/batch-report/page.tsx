import { BatchReport } from "@/src/components/BatchReport";

export const metadata = {
  title: "Batch report · BlueBottleCap for institutes",
  description:
    "See which topics your batch is struggling with. Upload your students' mock scores, get an aggregated weak-topic report faculty can act on this week.",
};

export default function BatchReportPage() {
  return <BatchReport />;
}
