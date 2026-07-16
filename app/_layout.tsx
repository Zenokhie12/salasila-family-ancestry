import { Stack } from "expo-router";

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: "Home" }} />
            <Stack.Screen name="add-person" options={{ title: "Add Person" }} />
        </Stack>
    )
}
