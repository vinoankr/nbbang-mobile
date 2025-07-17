import { Text } from "react-native";

export const BoldText = ({ children, className='' }: { children: React.ReactNode, className?: string }) => {
  return (
    <Text style={{ fontFamily: 'Pretendard-700'}} className={className}>
      {children}
    </Text> 
  )
}

export const SemiBoldText = ({ children, className='' }: { children: React.ReactNode, className?: string }) => {
  return (
    <Text style={{ fontFamily: 'Pretendard-600'}} className={className}>
      {children}
    </Text>
  )
}

export const MediumText = ({ children, className='' }: { children: React.ReactNode, className?: string }) => {
  return (
    <Text style={{ fontFamily: 'Pretendard-500'}} className={className}>
      {children}
    </Text>
  )
}

export const RegularText = ({ children, className='' }: { children: React.ReactNode, className?: string }) => {
  return (
    <Text style={{ fontFamily: 'Pretendard-400'}} className={className}>
      {children}
    </Text>
  )
}

export const LightText = ({ children, className='' }: { children: React.ReactNode, className?: string }) => {
  return (
    <Text style={{ fontFamily: 'Pretendard-300'}} className={className}>
      {children}
    </Text>
  )
}