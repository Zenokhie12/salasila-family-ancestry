import AsyncStorage from '@react-native-async-storage/async-storage';
import { Person, NewPersonInput } from '../types';
import * as Crypto from 'expo-crypto';

const STORAGE_KEY = 'salasila_people';

export async function getAllPeople(): Promise<Person[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

export async function addPerson(input: NewPersonInput): Promise<Person> {
  const people = await getAllPeople();

  const newPerson: Person = {
    id: Crypto.randomUUID(),
    fullName: input.fullName,
    nickName: input.nickName,
    honorificTitle: input.honorificTitle,
    clanName: input.clanName,
    occupation: input.occupation,
    isDeceased: input.isDeceased,
    dateOfBirth: input.dateOfBirth,
    placeOfBirth: input.placeOfBirth,
    currentAddress: input.currentAddress,
    spouseIds: [],
    media: [],
  };

  const updatedPeople = [...people, newPerson];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPeople));

  return newPerson;
}

export async function updatePerson(id: string, updatedFields: Partial<Person>): Promise<Person> {
  const people = await getAllPeople();

  const existingPerson = people.find(p => p.id === id);
  if (!existingPerson) {
    throw new Error(`Person with id ${id} not found`);
  }

  const mergedPerson = { ...existingPerson, ...updatedFields };
  const updatedPeople = people.map(p => (p.id === id ? mergedPerson : p));
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPeople));

  return mergedPerson;
};

export async function deletePerson(id: string): Promise<void> {
  const people = await getAllPeople();

  const findPerson = people.find(p => p.id === id);
  if (!findPerson) {
    throw new Error(`Person with id ${id} not found`);
  }

  const updatedPeople = people.filter(p => p.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPeople));
};
