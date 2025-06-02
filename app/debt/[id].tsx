import React, { useCallback, useState } from 'react';
import {
    View, Text, StyleSheet, Pressable, ScrollView,
    ActivityIndicator, SafeAreaView, StatusBar
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/utils/theme';
import { handleGetDebt, handleDeleteDebt } from '../../controller/DebtController';
import CustomAlert, { AlertButton } from '@/components/Alert';

export default function DebtDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [debt, setDebt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // CustomAlert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [alertButtons, setAlertButtons] = useState<AlertButton[]>([]);

  const showCustomAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    buttons: AlertButton[] = []
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertButtons(buttons);
    setAlertVisible(true);
  };

  // Fetch debt when screen is focused
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        try {
          const data = await handleGetDebt(id);
          if (isActive) setDebt(data);
        } catch (e) {
          showCustomAlert(
            'Error',
            'Failed to fetch debt',
            'error',
            [
              {
                text: 'OK',
                onPress: () => setAlertVisible(false),
                style: 'primary'
              }
            ]
          );
        } finally {
          if (isActive) setLoading(false);
        }
      })();
      return () => {
        isActive = false;
      };
    }, [id])
  );

  const confirmDelete = () => {
    showCustomAlert(
      'Confirm Delete',
      'Are you sure you want to delete this debt?',
      'warning',
      [
        {
          text: 'Cancel',
          onPress: () => setAlertVisible(false),
          style: 'secondary'
        },
        {
          text: 'Delete',
          onPress: async () => {
            setAlertVisible(false);
            await handleDeleteDebt(
              id,
              () => {
                showCustomAlert(
                  'Success',
                  'Debt deleted successfully',
                  'success',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        setAlertVisible(false);
                        router.back();
                      },
                      style: 'primary'
                    }
                  ]
                );
              },
              () => {
                showCustomAlert(
                  'Failed',
                  'Could not delete debt',
                  'error',
                  [
                    {
                      text: 'OK',
                      onPress: () => setAlertVisible(false),
                      style: 'primary'
                    }
                  ]
                );
              }
            );
          },
          style: 'destructive'
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loading}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={theme.colors.violet600} />
      </SafeAreaView>
    );
  }

  if (!debt) {
    return (
      <SafeAreaView style={styles.loading}>
        <StatusBar barStyle="light-content" />
        <Text style={{ color: '#888' }}>No debt found.</Text>
      </SafeAreaView>
    );
  }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                <Text style={styles.headerTitle}>Debt Details</Text>
                <Ionicons name="notifications" size={24} color="#fff" />
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>{debt.name}</Text>

                <View style={styles.card}>
                    <Ionicons name="cash-outline" size={36} color="#6A4EFF" style={styles.icon} />
                    <View>
                        <Text style={styles.amount}>{debt.amount}</Text>
                        <Text style={styles.status}>{debt.status}</Text>
                    </View>
                </View>

                <View style={styles.fieldBox}><Text style={styles.label}>Debtor</Text><Text style={styles.field}>{debt.debtorName}</Text></View>
                <View style={styles.fieldBox}><Text style={styles.label}>Detail</Text><Text style={styles.field}>{debt.detail}</Text></View>
                <View style={styles.fieldBox}><Text style={styles.label}>Created</Text><Text style={styles.field}>{new Date(debt.date).toDateString()}</Text></View>
                <View style={styles.fieldBox}><Text style={styles.label}>Due</Text><Text style={styles.field}>{new Date(debt.dueDate).toDateString()}</Text></View>

                <View style={styles.buttonWrapper}>
                    <Pressable style={styles.button} onPress={() => router.push(`/debt/editDebt/${id}`)}>
                        <Text style={styles.btnText}>Edit</Text>
                    </Pressable>
                    <Pressable style={styles.button} onPress={confirmDelete}>
                        <Text style={styles.btnText}>Delete</Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Custom Alert */}
            <CustomAlert
                isVisible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                type={alertType}
                buttons={alertButtons}
                onDismiss={() => setAlertVisible(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: theme.colors.violet600 
    },
    header: {
        flexDirection: 'row', 
        backgroundColor: theme.colors.violet600,
        padding: 32, 
        alignItems: 'center', 
        justifyContent: 'space-between'
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
    },
    loading: {
        backgroundColor: theme.colors.violet100,
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    content: {
        backgroundColor: theme.colors.violet100,
        padding: 20, 
        borderTopLeftRadius: 60, 
        borderTopRightRadius: 60,
        paddingBottom: 200
    },
    title: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        textAlign: 'center', 
        marginBottom: 20 
    },
    card: {
        backgroundColor: '#E4D7FF', 
        flexDirection: 'row', 
        alignItems: 'center',
        padding: 20, 
        borderRadius: 16, 
        marginBottom: 20, 
        justifyContent: 'space-between',
    },
    icon: { 
        backgroundColor: '#D9C8FF', 
        padding: 14, 
        borderRadius: 50, 
        marginRight: 20 
    },
    amount: { 
        fontSize: 20, 
        fontWeight: 'bold' 
    },
    status: { 
        color: '#333', 
        fontWeight: '600', 
        marginTop: 4 
    },
    fieldBox: { 
        marginBottom: 12 
    },
    label: { 
        fontWeight: '600', 
        color: '#555' 
    },
    field: { 
        backgroundColor: '#f6f1ff', 
        padding: 12, 
        borderRadius: 10, 
        marginTop: 4, 
        color: '#333' 
    },
    buttonWrapper: { 
        flexDirection: 'row', 
        gap: 20, 
        justifyContent: 'center' 
    },
    button: {
        backgroundColor: theme.colors.violet600,
        padding: 15, 
        borderRadius: 30, 
        marginTop: 30,
        alignItems: 'center', 
        minWidth: 100,
    },
    btnText: { 
        color: '#fff', 
        fontWeight: '600' 
    },
});
