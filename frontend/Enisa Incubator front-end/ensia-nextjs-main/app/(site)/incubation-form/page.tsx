import SubmitProjectForm from "components/form/FillForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Incubation Stage",
  description: "Form for mentors to define a new stage in the incubation process."
};

export default function AddStagePage() {
  return <SubmitProjectForm />;
}