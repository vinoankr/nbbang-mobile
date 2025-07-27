import { View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SemiBoldText } from './Texts';
import ChevronLeftIcon from '../../assets/icons/chevron-left.svg';
import { EllipsisVerticalIcon } from 'lucide-react-native';

const Header = ({
  title,
  showBackButton = false,
  onBackClick,
  showRightButton = false,
  onRightButtonClick,
  applyInsets = true,
}: {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showRightButton?: boolean;
  onRightButtonClick?: () => void;
  applyInsets?: boolean;
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute top-0 w-full flex-row items-center justify-between z-10 bg-white"
      style={{ top: applyInsets ? insets.top : 0 }}
    >
      {showBackButton ? (
        <TouchableOpacity onPress={() => onBackClick && onBackClick()} className="w-14 h-14 flex items-center justify-center">
          <ChevronLeftIcon width={26} height={26} />
        </TouchableOpacity>
      ) : (
        <View className="w-14 h-14" />
      )}
      <SemiBoldText className="text-lg text-gray-800">{title}</SemiBoldText>
      {showRightButton ? (
        <TouchableOpacity onPress={() => onRightButtonClick && onRightButtonClick()} className="w-14 h-14 flex items-center justify-center">
          <EllipsisVerticalIcon size={26} color="#71737C" strokeWidth={2} />
        </TouchableOpacity>
      ) : (
        <View className="w-14 h-14" />
      )}
    </View>
  );
};

export default Header;
