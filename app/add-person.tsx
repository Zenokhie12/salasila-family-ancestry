import { Text, View } from "react-native";
import { useState } from "react";
import { TextInput, Button } from "react-native";
import { addPerson } from "../storage/people";
import { Person } from "../types/person";

export default function AddPerson() {
    const [fullName, setFullName] = useState("");
    const [person, setPerson] = useState<Person | null>(null);
    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text>Add Person</Text>
            <TextInput
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
            />
            <Button title="save" onPress={async() => {
                const newPerson = await addPerson({ fullName: fullName });
                setPerson(newPerson);
                console.log("Person added:", newPerson);
            }} />
        </View>
    )
}