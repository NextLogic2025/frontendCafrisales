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
            "@react-native-community/datetimepicker"
        ],
        extra: {
            eas: {
                projectId: "19ed7eaa-a763-4e6e-a3bc-ccd138e5be86"
            }
        }
    }
}
