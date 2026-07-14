export type MediaAttachment = {
    id: string;
    type: 'photo';
    uri: string;
    caption?: string;
    dateAdded: string;
} |
{
    id: string;
    type: 'audio';
    uri: string;
    caption?: string;
    durationSeconds?: number;
    dateAdded: string;
} |
{
    id: string;
    type: 'story';
    title?: string;
    text: string;
    dateAdded: string;
};

