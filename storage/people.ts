import AsyncStorage from '@react-native-async-storage/async-storage';
import { Person } from '../types';

const STORAGE_KEY = 'salasila_people';

export async function getAllPeople(): Promise<Person[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};