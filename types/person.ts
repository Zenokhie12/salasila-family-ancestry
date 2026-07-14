import { MediaAttachment } from './media';

export type Person = {
    id: string;
    fullName: string;

    // Optional inputs
    nickName?: string;
    honorificTitle?: string; // e.g., Mr., Mrs., Dr., Hadji, Datu
    clanName?: string;       // Ancestral House / Branch Family Name
    occupation?: string;
    isDeceased?: boolean;

    dateOfBirth?: string;
    placeOfBirth?: string;
    currentAddress?: string;

    motherId?: string;
    fatherId?: string;
    spouseIds: string[];

    isRoot?: boolean;

    media: MediaAttachment[];
};

export type NewPersonInput = {
    fullName: string;

    nickName?: string;
    honorificTitle?: string;
    clanName?: string;
    occupation?: string;
    isDeceased?: boolean;

    dateOfBirth?: string;
    placeOfBirth?: string;
    currentAddress?: string;
};
