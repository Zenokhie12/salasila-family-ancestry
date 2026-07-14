import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function Home() {
    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text>Home</Text>
            <Link href="/add-person">
                <Text>Add Person</Text>
            </Link>
        </View>
    )
};

