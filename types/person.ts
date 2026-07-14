import { MediaAttachment } from './media';

export type Person = {
    id: string;
    fullName: string;

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
    honorificTitle?: string; // e.g., Mr., Mrs., Dr.,Hadji, Datu etc.
    clanName?: string; // e.g, Ancestral House or Branch Family Name


    dateOfBirth?: string;
    placeOfBirth?: string;
    currentAddress?: string;

    isDeceased?: boolean;

    occupation?: string; // Life long occupation or profession

    lineAge: 'paternal' | 'maternal' | 'both';
    fatherId?: string;
    motherId?: string;
    spouseIds: string[];
    childrenIds: string[];

    media: MediaAttachment[];
};