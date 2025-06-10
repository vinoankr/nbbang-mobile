import { Link, useRouter } from 'expo-router'
import React from 'react'
import { View, Text, Button } from 'react-native'

export default function Groups() {
  const router = useRouter();
  const mockGroups = [
    { id: 1, name: 'Group 1' },
    { id: 2, name: 'Group 2' },
    { id: 3, name: 'Group 3' },
  ]
  return (
    <View>
      <Text>Showing My Groups</Text>
      <Button title="Create Group" onPress={() => {
        router.push('/groups/create')
      }} />
      {mockGroups.map((group) => (
        <Link key={group.id} href={`/groups/${group.id}`} asChild>
          <Text>{group.name}</Text>
        </Link>
      ))}
    </View>
  )
}
