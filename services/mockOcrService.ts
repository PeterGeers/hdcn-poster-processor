import { EventDetails, CalendarType } from '../types';

export const mockExtractEventDetails = async (imageBase64: string): Promise<EventDetails> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock extracted data - in real scenario this would be from OCR
  return {
    title: "Ham Radio Event - Mock Data",
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Next week
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString().slice(0, 16), // +4 hours
    location: "Convention Center, Amsterdam",
    description: "Annual ham radio convention with exhibitions, workshops, and networking opportunities. Features latest equipment demonstrations and technical presentations.",
    calendar: CalendarType.NATIONAAL
  };
};