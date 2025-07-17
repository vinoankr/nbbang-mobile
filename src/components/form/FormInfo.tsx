import { MediumText } from "../Texts";

export const FormInfo = ({ message, isError=false }: { message: string | undefined, isError?: boolean }) => {
  if (!message) return null;

  return (
    <MediumText className={`mt-1 ml-0.5 text-sm ${isError ? 'text-red-500' : 'text-gray-500'}`}>{message}</MediumText>
  );
};  