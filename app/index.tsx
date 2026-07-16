import { Button, Text, View } from "react-native";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { getAllPeople, updatePerson } from "../storage/people";
import { Person } from "../types/person";

export default function Home() {
    const [people, setPeople] = useState<Person[]>([]);

    const fetchPeople = async () => {
            const allPeople = await getAllPeople();
            setPeople(allPeople);
        };

    useEffect(() => {
        fetchPeople();
    }, []);

    const handleSetAsRoot = async (personId: string) => {
        const updatedPerson = await updatePerson (personId, {isRoot: true});
        console.log("Set a root: ", updatedPerson);
        fetchPeople();
    };

    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text>Home</Text>
            <Link href="/add-person">
                <Text>Add Person</Text>
            </Link>

            {people.map((person) => (
                <View key={person.id}>
                    <Text>{person.fullName} {person.isRoot ? "(root)" : ""} </Text>
                    <Button title="set as root" onPress={() => handleSetAsRoot(person.id)} />
                </View>
            ))}
        </View>
    )
};

