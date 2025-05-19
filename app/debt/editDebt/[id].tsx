import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import { theme } from '@/utils/theme';
import { Ionicons } from '@expo/vector-icons';

export default function EditDebt() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [form, setForm] = useState({
        name: '',
        type: '',
        amount: '',
        debtor_name: '',
        detail: '',
        debt_date: new Date(),
        due_date: new Date(),
        status: '',
    });

    const [loading, setLoading] = useState(true);
    const [loadingAdd, setLoadingAdd] = useState(false);

    const [showDebtDate, setShowDebtDate] = useState(false);
    const [showDueDate, setShowDueDate] = useState(false);

    const [openType, setOpenType] = useState(false);
    const [typeValue, setTypeValue] = useState(null);
    const [typeItems, setTypeItems] = useState([
        { label: 'Lent', value: 'lend' },
        { label: 'Borrowed', value: 'borrow' },
    ]);

    const [openStatus, setOpenStatus] = useState(false);
    const [statusValue, setStatusValue] = useState(null);
    const [statusItems, setStatusItems] = useState([
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
    ]);

    const fetchData = async () => {
        try {
            const res = await fetch(`https://6829e5e9ab2b5004cb35235d.mockapi.io/debts/${id}`);
            const data = await res.json();
            setForm({
                name: data.name,
                type: data.type,
                amount: data.amount.toString(),
                debtor_name: data.debtor_name,
                detail: data.detail,
                debt_date: new Date(data.debt_date),
                due_date: new Date(data.due_date),
                status: data.status,
            });
            setLoading(false);
        } catch (error) {
            console.error('Error loading debt:', error);
        } finally {
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#6A4EFF" />
            </View>
        );
    }

    const handleChange = (key: string, value: any) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setLoadingAdd(true);
        try {
            await fetch(`https://6829e5e9ab2b5004cb35235d.mockapi.io/debts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    amount: parseFloat(form.amount),
                }),
            });
            router.back();
        } catch (err) {
            console.error('Error saving debt:', err);
        } finally {
            setLoadingAdd(false);
        }
    };


    const formatDate = (date: Date) => {
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };


    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                <Text style={styles.headerTitle}>Edit Debt</Text>
                <Ionicons name="notifications" size={24} color="#fff" />
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.label}>Name</Text>
                <TextInput style={styles.input} value={form.name} onChangeText={val => handleChange('name', val)} />

                <View style={{ zIndex: 2000 }}>
                    <Text style={styles.label}>Type</Text>
                    <DropDownPicker
                        open={openType}
                        setOpen={setOpenType}
                        items={typeItems}
                        setItems={setTypeItems}
                        value={form.type}
                        setValue={val => handleChange('type', val())}
                        zIndex={3000}
                        zIndexInverse={2000}
                    />

                </View>


                <Text style={styles.label}>Amount</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={form.amount}
                    onChangeText={val => handleChange('amount', val)}
                />

                <Text style={styles.label}>Debtor Name</Text>
                <TextInput style={styles.input} value={form.debtor_name} onChangeText={val => handleChange('debtor_name', val)} />

                <Text style={styles.label}>Detail</Text>
                <TextInput
                    style={[styles.input, { height: 80 }]}
                    multiline
                    value={form.detail}
                    onChangeText={val => handleChange('detail', val)}
                />

                <View style={styles.dateWrapper}>
                    <View style={styles.datePicker}>
                        <Text style={styles.label}>Debt Date</Text>
                        <TouchableOpacity onPress={() => setShowDebtDate(true)}>
                            <TextInput
                                style={[styles.input]}
                                value={formatDate(form.debt_date)}
                                editable={false}
                            />
                        </TouchableOpacity>
                        {showDebtDate && (
                            <DateTimePicker
                                value={form.debt_date}
                                mode="date"
                                display="default"
                                onChange={(e, selectedDate) => {
                                    setShowDebtDate(false);
                                    if (selectedDate) handleChange('debt_date', selectedDate);
                                }}
                            />
                        )}
                    </View>

                    <View style={styles.datePicker}>
                        <Text style={styles.label}>Due Date</Text>
                        <TouchableOpacity onPress={() => setShowDueDate(true)}>
                            <TextInput
                                style={[styles.input]}
                                value={formatDate(form.due_date)}
                                editable={false}
                            />
                        </TouchableOpacity>
                        {showDueDate && (
                            <DateTimePicker
                                value={form.due_date}
                                mode="date"
                                display="compact"
                                onChange={(e, selectedDate) => {
                                    setShowDueDate(false);
                                    if (selectedDate) handleChange('due_date', selectedDate);
                                }}
                            />
                        )}
                    </View>
                </View>

                <View style={{ zIndex: 1000 }}>
                    <Text style={styles.label}>Status</Text>
                    <DropDownPicker
                        open={openStatus}
                        setOpen={setOpenStatus}
                        items={statusItems}
                        setItems={setStatusItems}
                        value={form.status}
                        setValue={val => handleChange('status', val())}
                        zIndex={2000}
                        zIndexInverse={2000}
                    />
                </View>

                <View style={styles.buttonWrapper}>
                    <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={handleSave}>
                        {loadingAdd ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save</Text>}
                    </TouchableOpacity>
                </View>
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
        padding: 32,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    loading: {
        backgroundColor: theme.colors.violet100,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }, content: {
        height: '100%',
        padding: 20,
        paddingTop: 40,
        backgroundColor: theme.colors.violet100,
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60,
    },
    label: {
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        color: '#333',
    },
    input: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 10,
        fontSize: 16,
    },
    dateWrapper: {
        flexDirection: 'row',
        gap: '5%',
    },
    buttonWrapper: {
        flexDirection: 'row',
        gap: '5%',
        justifyContent: 'center',
    },
    datePicker: {
        flex: 1,
    },
    button: {
        backgroundColor: theme.colors.violet600,
        padding: 15,
        borderRadius: 30,
        marginTop: 30,
        alignItems: 'center',
        minWidth: 100,
    },
    buttonText: { color: '#fff', fontWeight: '600' },
});
