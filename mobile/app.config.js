export default {
    expo: {
        name: "Cafrilosa",
        slug: "cafrilosa",
        version: "0.1.0",
        orientation: "portrait",
        icon: "./assets/logo.png",
        userInterfaceStyle: "dark",
        splash: {
            image: "./assets/logo.png",
            resizeMode: "contain",
            backgroundColor: "#F0412D"
        },
        assetBundlePatterns: ["**/*"],
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/logo.png",
                backgroundColor: "#F0412D"
            },
            config: {
                googleMaps: {
                    apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
                }
            },
            package: "com.cafrilosa.mobile",
            usesCleartextTraffic: true
        },
        ios: {
            supportsTablet: true,
            config: {
                googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
            },
            bundleIdentifier: "com.cafrilosa.mobile"
        },
        plugins: [
            "@react-native-community/datetimepicker",
            "expo-secure-store"
        ],
        experiments: {
            reactCompiler: true
        },
        extra: {
            eas: {
                projectId: "19ed7eaa-a763-4e6e-a3bc-ccd138e5be86"
            },
            EXPO_PUBLIC_AUTH_API_URL: process.env.EXPO_PUBLIC_AUTH_API_URL,
            EXPO_PUBLIC_AUTH_LOGIN_URL: process.env.EXPO_PUBLIC_AUTH_LOGIN_URL,
            EXPO_PUBLIC_AUTH_FORGOT_PASSWORD_URL: process.env.EXPO_PUBLIC_AUTH_FORGOT_PASSWORD_URL,
            EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
            EXPO_PUBLIC_USERS_API_URL: process.env.EXPO_PUBLIC_USERS_API_URL,
            EXPO_PUBLIC_CATALOG_API_URL: process.env.EXPO_PUBLIC_CATALOG_API_URL,
            EXPO_PUBLIC_ORDER_API_URL: process.env.EXPO_PUBLIC_ORDER_API_URL,
            EXPO_PUBLIC_CREDIT_API_URL: process.env.EXPO_PUBLIC_CREDIT_API_URL,
            EXPO_PUBLIC_ZONE_API_URL: process.env.EXPO_PUBLIC_ZONE_API_URL,
            EXPO_PUBLIC_ROUTE_API_URL: process.env.EXPO_PUBLIC_ROUTE_API_URL,
            EXPO_PUBLIC_DELIVERY_API_URL: process.env.EXPO_PUBLIC_DELIVERY_API_URL,
            EXPO_PUBLIC_NOTIFICATIONS_API_URL: process.env.EXPO_PUBLIC_NOTIFICATIONS_API_URL,
            EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
    }
}
