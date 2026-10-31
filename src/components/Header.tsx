import { View, TouchableOpacity } from 'react-native';

import { SemiBoldText } from './Texts';
import ChevronLeftIcon from '../../assets/icons/chevron-left.svg';
import { EllipsisVerticalIcon } from 'lucide-react-native';

const Header = ({
  title,
  showBackButton = false,
  onBackClick,
  showRightButton = false,
  onRightButtonClick,
}: {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showRightButton?: boolean;
  onRightButtonClick?: () => void;
}) => {
  return (
    <View
      className="w-full min-h-14 flex-row items-center justify-between bg-white"
    >
      {showBackButton ? (
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="뒤로" onPress={() => onBackClick && onBackClick()} className="w-14 h-14 flex items-center justify-center">
          <ChevronLeftIcon width={26} height={26} />
        </TouchableOpacity>
      ) : (
        <View className="w-14 h-14" />
      )}
      <SemiBoldText className="flex-1 text-center text-lg text-gray-800" numberOfLines={1}>{title}</SemiBoldText>
      {showRightButton ? (
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="화면 설정" onPress={() => onRightButtonClick && onRightButtonClick()} className="w-14 h-14 flex items-center justify-center">
          <EllipsisVerticalIcon size={26} color="#71737C" strokeWidth={2} />
        </TouchableOpacity>
      ) : (
        <View className="w-14 h-14" />
      )}
    </View>
  );
};

export default Header;
