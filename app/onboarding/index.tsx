import React, { useRef, useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
    Image,
    SafeAreaView,
    Animated,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "@/utils/theme";

const { width, height } = Dimensions.get("window");

const slides = [
    {
        id: "1",
        title: "Quick analysis of all expenses",
        description:
            "All expenses by cards are reflected automatically in the application, and the analytics system helps to control them.",
        image: require("../../assets/images/figure.png"),
    },
    {
        id: "2",
        title: "Tips to optimize spending",
        description:
            "The system notices where you're slipping on the budget and tells you how to optimize costs.",
        image: require("../../assets/images/figure.png"),
    },
    {
        id: "3",
        title: "Save for your dreams",
        description: "",
        image: require("../../assets/images/figure.png"),
    },
];

const Onboarding = () => {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            flatListRef.current?.scrollToIndex({ index: currentIndex - 1 });
        }
    };

    const renderItem = ({ item }: { item: (typeof slides)[0] }) => (
        <View style={styles.slide}>
            <Animated.Image
                source={require("../../assets/images/coin-full.png")}
                style={[
                    styles.coinImage,
                    {
                        transform: [{ translateY: coinOffset }],
                    },
                ]}
            />
            <Image
                source={require("../../assets/images/figure.png")}
                style={styles.image}
                resizeMode="contain"
            />
            <View style={styles.textWrapper}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>

            {item.id === "3" && (
                <TouchableOpacity
                    onPress={() => {
                        AsyncStorage.setItem("alreadyLaunched", "true");
                        router.replace("/auth/signIn");
                    }} // Chuyển hướng đến tabs sau khi hoàn thành
                    style={styles.ctaButton}
                >
                    <Text style={styles.ctaText}>Become a billionaire right now!</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const coinOffset = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(coinOffset, {
            toValue: currentIndex * 125,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, [currentIndex]);

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={slides}
                ref={flatListRef}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
                renderItem={renderItem}
            />

            <View style={styles.bottomControls}>
                {currentIndex > 0 ? (
                    <TouchableOpacity onPress={handlePrev} style={styles.arrowButton}>
                        <Text style={styles.arrowText}>{"<"}</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 48 }} />
                )}

                <View style={styles.pagination}>
                    {slides.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                { backgroundColor: i === currentIndex ? "#5C4DBE" : "#ccc" },
                            ]}
                        />
                    ))}
                </View>

                {currentIndex < slides.length - 1 ? (
                    <TouchableOpacity onPress={handleNext} style={styles.arrowButton}>
                        <Text style={styles.arrowText}>{">"}</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 48 }} />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    slide: {
        width,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 30,
        paddingTop: 40,
    },
    image: {
        position: "absolute",
        width: width,
        top: height * 0.5 - 250,
        marginBottom: 20,
    },
    textWrapper: {
        position: "absolute",
        top: height * 0.5 + 120,
    },
    title: {
        fontSize: 16,
        fontFamily: "Poppins-Bold",
        color: "#000",
        textAlign: "center",
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        fontFamily: "Poppins-Regular",
        color: "#333",
        textAlign: "center",
        paddingHorizontal: 10,
    },
    arrowButton: {
        backgroundColor: theme.colors.violet600,
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    arrowText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    ctaButton: {
        position: "absolute",
        top: height * 0.5 + 150,
        marginTop: 30,
        backgroundColor: theme.colors.violet600,
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 28,
    },
    ctaText: {
        color: "#fff",
        fontFamily: "Poppins-Bold",
        fontSize: 12,
    },
    bottomControls: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 30,
        marginBottom: 30,
    },
    pagination: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    coinImage: {
        width: width,
        position: "absolute",
        top: -250,
        zIndex: 0,
    },
});

export default Onboarding;
