import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { View, Text, Button, ScrollView, TextInput, Alert, StyleSheet } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'

import { clearOfflineMutations } from '../../utils/offlineQueue'
import { useNetwork } from '../../contexts/NetworkContext'
import { mmkvStorage } from '../../utils/storage'

// Import our custom hooks
import { 
  useTestData, 
  useCreateTestData, 
  useUpdateTestData, 
  useDeleteTestData 
} from '../../hooks'

export default function Groups() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isConnected } = useNetwork();
  
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [updateId, setUpdateId] = useState('');
  const [deleteId, setDeleteId] = useState('');

  // Form reset handlers
  const resetCreateForm = () => {
    setCountry('');
    setCity('');
  };

  const resetUpdateForm = () => {
    setUpdateId('');
    setCountry('');
    setCity('');
  };

  const resetDeleteForm = () => {
    setDeleteId('');
  };

  // Custom hooks
  const { data: testData, isLoading, error, refetch } = useTestData();

  const createMutation = useCreateTestData({
    onFormReset: resetCreateForm,
  });

  const updateMutation = useUpdateTestData({
    onFormReset: resetUpdateForm,
  });

  const deleteMutation = useDeleteTestData({
    onFormReset: resetDeleteForm,
  });

  // Event handlers
  const handleCreate = () => {
    if (!country || !city) {
      Alert.alert('입력 오류', '국가와 도시를 모두 입력해주세요.');
      return;
    }
    createMutation.mutate({ country, city });
  };

  const handleUpdate = () => {
    if (!updateId || !country || !city) {
      Alert.alert('입력 오류', 'ID, 국가, 도시를 모두 입력해주세요.');
      return;
    }
    updateMutation.mutate({ id: parseInt(updateId), country, city });
  };

  const handleDelete = () => {
    if (!deleteId) {
      Alert.alert('입력 오류', '삭제할 ID를 입력해주세요.');
      return;
    }
    deleteMutation.mutate(parseInt(deleteId));
  };

  const clearCache = () => {
    queryClient.clear();
    Alert.alert('캐시 삭제', '모든 캐시가 삭제되었습니다.');
  };

  const handleClearOfflineQueue = () => {
    clearOfflineMutations();
    Alert.alert('오프라인 큐 삭제', '오프라인 큐가 삭제되었습니다.');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>TanStack Query + MMKV 오프라인 테스트</Text>

      {/* 로그아웃 */}
      <Button title="로그아웃" onPress={() => {
        mmkvStorage.removeItem('authToken');
        mmkvStorage.removeItem('userData');
        router.replace('/auth');
      }} />
      
      {/* 네트워크 상태 */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          네트워크 상태: {isConnected === null ? '확인 중...' : isConnected ? '🟢 온라인' : '🔴 오프라인'}
        </Text>
      </View>

      {/* 데이터 조회 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 데이터 조회 (캐시 테스트)</Text>
        <Button title="데이터 새로고침" onPress={() => refetch()} />
        
        {isLoading && <Text>로딩 중...</Text>}
        {error && <Text style={styles.error}>오류: {error.message}</Text>}
        
        <View style={styles.dataContainer}>
          <Text style={styles.dataTitle}>조회된 데이터:</Text>
          {testData?.map((item) => (
            <Text key={item.id} style={styles.dataItem}>
              ID: {item.id} | {item.country} - {item.city}
            </Text>
          ))}
        </View>
      </View>

      {/* 데이터 생성 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>➕ 데이터 생성</Text>
        <TextInput
          style={styles.input}
          placeholder="국가"
          value={country}
          onChangeText={setCountry}
        />
        <TextInput
          style={styles.input}
          placeholder="도시"
          value={city}
          onChangeText={setCity}
        />
        <Button 
          title="생성" 
          onPress={handleCreate}
          disabled={createMutation.isPending}
        />
      </View>

      {/* 데이터 업데이트 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✏️ 데이터 업데이트</Text>
        <TextInput
          style={styles.input}
          placeholder="업데이트할 ID"
          value={updateId}
          onChangeText={setUpdateId}
          keyboardType="numeric"
        />
        <Button 
          title="업데이트" 
          onPress={handleUpdate}
          disabled={updateMutation.isPending}
        />
      </View>

      {/* 데이터 삭제 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🗑️ 데이터 삭제</Text>
        <TextInput
          style={styles.input}
          placeholder="삭제할 ID"
          value={deleteId}
          onChangeText={setDeleteId}
          keyboardType="numeric"
        />
        <Button 
          title="삭제" 
          onPress={handleDelete}
          disabled={deleteMutation.isPending}
        />
      </View>

      {/* 유틸리티 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔧 유틸리티</Text>
        <View style={styles.buttonContainer}>
          <Button title="캐시 삭제" onPress={clearCache} />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="오프라인 큐 삭제" onPress={handleClearOfflineQueue} />
        </View>
      </View>

      {/* 기존 그룹 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 그룹 관리</Text>
        <Button title="그룹 생성" onPress={() => router.push('/groups/create')} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusContainer: {
    backgroundColor: '#e1f5fe',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 8,
    borderRadius: 4,
    backgroundColor: '#fafafa',
  },
  dataContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  dataTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dataItem: {
    padding: 4,
    fontSize: 14,
  },
  error: {
    color: 'red',
    fontSize: 14,
  },
  buttonContainer: {
    marginBottom: 8,
  },
});
