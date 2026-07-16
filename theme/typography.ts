import { TextStyle } from "react-native";

export const typography: Record<string, TextStyle> = {
    heading: {
        fontSize: 22,
        fontWeight: '700' as const,
        fontFamily: 'cinzel decorative' as const,
    },

    subheading: {
        fontSize: 16, 
        fontWeight: '600' as const,
        fontFamily: 'cinzel' as const,
    },

    body: {
        fontSize: 14,
        fontWeight: '400' as const,
        fontFamily: 'inter sans-serif' as const,
    },
    
    caption: {
        fontSize: 12,
        fontWeight: '400' as const,
        fontStyle: 'italic' as const,
    }
};