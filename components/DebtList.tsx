import { theme } from '@/utils/theme';
import React from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';

export default function DebtList({ data }: any) {
    // Nhóm theo tháng
    const grouped: Record<string, any[]> = {};
    const router = useRouter();

    data.forEach((item: any) => {
        const date = new Date(item.debt_date);
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.getFullYear();
        const key = `${month} ${year}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(item);
    });


    const handlePress = (item: any) => {
        router.push({ pathname: '/debt/[id]', params: { id: item.id } });
    }

    return (
        <View style={{ gap: 20 }}>
            {Object.entries(grouped).map(([month, items]) => (
                <View key={month}>
                    <Text style={styles.section}>{month}</Text>
                    {items.map((item: any) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.row}
                            onPress={() => handlePress(item)}
                        >
                            <View>
                                <Text style={styles.name}>{item.name}</Text>
                                <Text style={styles.date}>
                                    {new Date(item.debt_date).toLocaleDateString()}
                                </Text>
                            </View>
                            <Text style={[styles.status, styles.separator]}>{item.status}</Text>
                            <Text
                                style={[
                                    styles.amount,
                                    {
                                        color:
                                            item.type === 'borrow'
                                                ? theme.colors.yellow500
                                                : theme.colors.greenText,
                                    },
                                ]}
                            >
                                ${item.amount.toFixed(2)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        fontFamily: 'Poppins-Medium',
        marginBottom: 8,
        color: theme.colors.greenText,
        paddingHorizontal: 12,
    },
    separator: {
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderLeftWidth: 1,
        borderLeftColor: theme.colors.violet600,
        borderRightWidth: 1,
        borderRightColor: theme.colors.violet600,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        padding: 12,
        borderRadius: 10,
    },
    name: { fontWeight: 'bold', fontSize: 16 },
    date: { color: '#777', fontSize: 12 },
    status: {
        textTransform: 'capitalize',
        alignSelf: 'center',
        justifyContent: 'center',
    },
    amount: { fontWeight: 'bold', alignSelf: 'center' },
});