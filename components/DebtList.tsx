import { theme } from '@/utils/theme';
import React from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, Image } from 'react-native';

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
                            <View style={styles.typeIcon}>
                                {item.type == "lend" ? (
                                    <Image
                                        source={require("../assets/images/lent.png")}
                                        style={{ width: 30, height: 30, tintColor: theme.colors.whiteText }}
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <Image
                                        source={require("../assets/images/borrowed.png")}
                                        style={{ width: 30, height: 30, tintColor: theme.colors.whiteText }}
                                        resizeMode="contain"
                                    />
                                )}
                            </View>
                            <View style={styles.nameDate}>
                                <Text style={styles.name}>{item.name}</Text>
                                <Text style={styles.date}>
                                    {new Date(item.debt_date).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </Text>
                            </View>
                            <View style={{ width: 100, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={[styles.status, styles.separator]}>{item.status}</Text>
                            </View>
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
        fontSize: 14,
        marginBottom: 8,
        color: theme.colors.greenText,
        paddingHorizontal: 12,
    },
    separator: {
        paddingHorizontal: 12,
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
    nameDate: {
        minWidth: 70,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    name: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        textAlign: 'left'
    },
    date: {
        color: theme.colors.blueText,
        fontSize: 11,
        fontFamily: 'Poppins-SemiBold',
    },
    status: {
        textTransform: 'capitalize',
        alignSelf: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontFamily: 'Poppins-Light',
    },
    amount: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        alignSelf: 'center'
    },
    typeIcon: {
        width: 57,
        height: 53,
        borderRadius: 22,
        backgroundColor: theme.colors.purple300,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
});