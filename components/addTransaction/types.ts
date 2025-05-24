// src/types.ts (or similar path)
export interface Category {
  id: string;
  name: string;
  icon: string; // Or a more specific icon name type if you have one
  iconColor: string;
  bgColor: string;
}

export interface CategoryGroupData {
  groupName: string;
  items: Category[];
}

export interface NavItem {
  name: string;
  icon: string; // Or specific icon name type
  active?: boolean; // For the main screen's bottom nav
}

export type TransactionTypeId = 'expense' | 'income';

// For DateTimePicker
export interface DateTimePickerEvent {
  type: 'set' | 'dismissed' | string; // Adjust as per library's actual event types
  nativeEvent: {
    timestamp?: number; // timestamp is optional
    utcOffset?: number;
  };
}