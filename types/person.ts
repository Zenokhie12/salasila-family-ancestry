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