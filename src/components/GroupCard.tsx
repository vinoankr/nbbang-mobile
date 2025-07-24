import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { SemiBoldText, BoldText, MediumText } from './Texts';
import YellowStar from '../../assets/icons/yellow-star.svg';
import GrayStar from '../../assets/icons/gray-star.svg';
import Person from '../../assets/icons/person.svg';
import { formatDate } from '@/src/utils/formatter';

interface Group {
  id: string;
  name: string;
  member_count: number;
  updated_at?: string;
}

interface User {
  id: string;
  primary_group_id?: string;
}

interface GroupCardProps {
  group: Group;
  user: User | null;
  isUpdating: boolean;
  onSetPrimaryGroup: (groupId: string) => void;
  navigateToGroup: (groupId: string) => void;
}

export default function GroupCard({ 
  group, 
  user, 
  isUpdating, 
  navigateToGroup,
  onSetPrimaryGroup, 
}: GroupCardProps) {
  const isPrimaryGroup = user?.primary_group_id === group.id;

  return (
    <TouchableOpacity 
      onPress={()=>navigateToGroup(group.id)}
      className="p-4 rounded-xl"
      style={{ backgroundColor: '#F6F6FA', borderColor: '#EEEFF3', borderWidth: 1, marginBottom: 8 }}
      disabled={isUpdating}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between">
        <BoldText className="text-lg text-gray-800 flex-1">
          {group.name}
        </BoldText>
        
        <TouchableOpacity
          onPress={() => onSetPrimaryGroup(group.id)}
          className={`p-1 rounded-lg bg-white ${isPrimaryGroup ? 'text-yellow-500' : 'text-gray-400'}`}
          disabled={isUpdating}
        >
          {isPrimaryGroup ? (
            <YellowStar className="w-6 h-6" />
          ) : (
            <GrayStar className="w-6 h-6" />
          )}
        </TouchableOpacity>
      </View>
      
      <View className="flex-row items-center justify-between mt-1.5">
        <View className="flex-row items-center">
          <Person width={14} height={14} style={{ marginRight: 4 }} />
          <SemiBoldText className="text-gray-800 text-base">
            {group.member_count}명
          </SemiBoldText>
        </View>
        {group.updated_at && (
          <MediumText className="text-gray-600 text-base">
            {formatDate(group.updated_at)}
          </MediumText>
        )}
      </View>
    </TouchableOpacity>
  );
} 