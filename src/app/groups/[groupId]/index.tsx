import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Button } from 'react-native';

export default function GroupDetail() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams();
  
  return (
    <View>
      <Text>Group ID: {groupId}</Text>
      <Button title="Edit Group" onPress={() => {
        router.push(`/groups/${groupId}/edit`);
      }} />
      <Button title="go back to list" onPress={() => {
        if (router.canDismiss()) {
          router.dismissTo('/groups');
        } else {
          router.replace('/groups');
        }
      }} />
    </View>
  );
}
