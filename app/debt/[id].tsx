import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import React from 'react';
import { theme } from '@/utils/theme';

export default function DebtDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [debt, setDebt] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const fetchDebt = async () => {
                try {
                    const response = await fetch(`https://6829e5e9ab2b5004cb35235d.mockapi.io/debts/${id}`);
                    const json = await response.json();
                    setDebt(json);
                } catch (error) {
                    console.error('Failed to fetch debt:', error);
                    Alert.alert('Error', 'Could not load debt detail');
                } finally {
                    setLoading(false);
                }
            };

            fetchDebt();
        }, [id])
    );

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#6A4EFF" />
            </View>
        );
    }

    if (!debt) {
        return (
            <View style={styles.loading}>
                <Text style={{ color: '#888' }}>No debt found.</Text>
            </View>
        );
    }

    const handleDelete = async () => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this debt?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const res = await fetch(`https://6829e5e9ab2b5004cb35235d.mockapi.io/debts/${id}`, {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                            });

                            if (res.ok) {
                                Alert.alert('Deleted', 'Debt has been deleted.');
                                router.back(); // or go back to the list
                            } else {
                                Alert.alert('Failed', 'Could not delete debt.');
                            }
                        } catch (err) {
                            console.error(err);
                            Alert.alert('Error', 'Something went wrong.');
                        }
                    },
                },
            ]
        );
    };


    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                <Text style={styles.headerTitle}>Debt Details</Text>
                <Ionicons name="notifications" size={24} color="#fff" />
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.title}>{debt.name}</Text>

                <View style={styles.card}>
                    <View style={styles.iconWrapper}>
                        {debt.type == "lend" ? (
                            <>
                                <Image
                                    source={require("../../assets/images/lent.png")}
                                    style={{ width: 50, height: 50, }}
                                    resizeMode="contain"
                                />
                                <Text style={styles.textType}>Lent</Text></>
                        ) : (
                            <>
                                <Image
                                    source={require("../../assets/images/borrowed.png")}
                                    style={{ width: 50, height: 50, }}
                                    resizeMode="contain"
                                />
                                <Text style={styles.textType}>Borrowed</Text>
                            </>
                        )}
                    </View>
                    <View style={{ flexDirection: 'column', gap: 20 }}>
                        <View>
                            <Text style={styles.titleAmount}>Amount</Text>
                            <Text style={styles.amount}>${debt.amount.toFixed(2)}</Text>
                        </View>
                        <View>
                            <Text style={styles.titleAmount}>Status</Text>
                            <Text style={styles.status}>{debt.status.charAt(0).toUpperCase() + debt.status.slice(1)}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.fieldBox}>
                    <Text style={styles.label}>Debtor Name</Text>
                    <Text style={styles.field}>{debt.debtor_name}</Text>
                </View>
                <View style={styles.fieldBox}>
                    <Text style={styles.label}>Detail</Text>
                    <Text style={styles.field}>{debt.detail}</Text>
                </View>
                <View style={styles.fieldBox}>
                    <Text style={styles.label}>Debt Date</Text>
                    <Text style={styles.field}>{new Date(debt.debt_date).toDateString()}</Text>
                </View>
                <View style={styles.fieldBox}>
                    <Text style={styles.label}>Due Date</Text>
                    <Text style={styles.field}>{new Date(debt.due_date).toDateString()}
                    </Text>

                </View>

                <View style={styles.buttonWrapper}>
                    <Pressable style={styles.button} onPress={() => router.push(`/debt/editDebt/${id}`)}>
                        <Text style={styles.btnText}>Edit</Text>
                    </Pressable>
                    <Pressable style={styles.button} onPress={handleDelete}>
                        <Text style={styles.btnText}>Delete</Text>
                    </Pressable>
                </View>
                <View style={{ height: 124 }} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.violet600,
    },
    header: {
        flexDirection: 'row',
        backgroundColor: theme.colors.violet600,
        padding: 30,
        paddingBottom: 16,
        paddingTop: 50,
        alignItems: 'center',
        justifyContent: 'space-between',
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
        height: '100%',
        padding: 30,
        backgroundColor: theme.colors.violet100,
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60,
    },
    title: {
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 5,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingRight: 15,
        borderRadius: 16,
        marginBottom: 20,
        justifyContent: 'space-between',
    },
    iconWrapper: {
        backgroundColor: theme.colors.purple300,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        width: '55%',
        height: 150,
    },
    textType: {
        marginTop: 10,
        fontFamily: 'Poppins-Medium',
        fontSize: 18,
    },
    titleAmount: {
        fontSize: 16,
        fontFamily: 'Poppins-Medium',
    },
    amount: {
        fontSize: 18,
        fontFamily: 'Poppins-Bold',
    },
    status: {
        color: '#333',
        fontSize: 18,
        fontFamily: 'Poppins-Bold',
    },
    fieldBox: { marginBottom: 12 },
    label: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        color: theme.colors.greenText,
    },
    field: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        color: theme.colors.greenText,
        backgroundColor: theme.colors.whiteText,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 24,
    },
    buttonWrapper: {
        flexDirection: 'row',
        gap: '5%',
        justifyContent: 'center',
    },
    button: {
        backgroundColor: theme.colors.violet600,
        padding: 15,
        borderRadius: 30,
        marginTop: 30,
        alignItems: 'center',
        minWidth: 100,
    },
    btnText: { color: '#fff', fontWeight: '600' },
});
