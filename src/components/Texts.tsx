import { Text, TextProps } from "react-native";

interface CustomTextProps extends Omit<TextProps, 'style'> {
  children: React.ReactNode;
  className?: string;
}

export const BoldText = ({ children, className='', ...props }: CustomTextProps) => {
  return (
    <Text style={{ fontFamily: 'Pretendard-700'}} className={className} {...props}>
      {children}
    </Text> 
  )
}

export const SemiBoldText = ({ children, className='', ...props }: CustomTextProps) => {
  return (
    <Text style={{ fontFamily: 'Pretendard-600'}} className={className} {...props}>
      {children}
    </Text>
  )
}

export const MediumText = ({ children, className='', ...props }: CustomTextProps) => {
  return (
    <Text style={{ fontFamily: 'Pretendard-500'}} className={className} {...props}>
      {children}
    </Text>
  )
}