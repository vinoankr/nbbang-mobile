import { Text, View } from "react-native";
import { verifyInstallation } from 'nativewind';

export default function Index() {
  // verifyInstallation();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="text-bold text-red-500">hello world</Text>
    </View>
  );
}
