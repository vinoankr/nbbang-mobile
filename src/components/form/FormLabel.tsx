import { SemiBoldText } from "@/src/components/Texts";

export const FormLabel = ({ label }: { label: string }) => {
  return <SemiBoldText className="text-[17px] mb-2 mr-[2px]">{label}</SemiBoldText>;
};