import { TransactionItemData } from "@/components/addTransaction/types";

const dummyTransactions: TransactionItemData[] = [
    { id: '1', title: 'Salary', dateTime: '18:27 - April 30', categoryDisplay: 'Monthly', amount: '4,000.00', amountRaw: 4000, type: 'income', iconName: 'cash-multiple', dateObject: new Date('2024-04-30T18:27:00'), detail: 'Monthly salary deposit' },
    { id: '2', title: 'Groceries', dateTime: '17:00 - April 24', categoryDisplay: 'Pantry', amount: '100.00', amountRaw: -100, type: 'expense', iconName: 'cart-outline', dateObject: new Date('2024-04-24T17:00:00'), detail: 'Weekly grocery shopping at Coles' },
    { id: '3', title: 'Rent', dateTime: '08:30 - April 15', categoryDisplay: 'Rent', amount: '674.40', amountRaw: -674.40, type: 'expense', iconName: 'home-outline', dateObject: new Date('2024-04-15T08:30:00') }, // detail can be optional
    { id: '4', title: 'Transport', dateTime: '07:30 - April 08', categoryDisplay: 'Fuel', amount: '4.13', amountRaw: -4.13, type: 'expense', iconName: 'bus', dateObject: new Date('2024-04-08T07:30:00') },
    { id: '5', title: 'Dinner Out', dateTime: '19:30 - March 31', categoryDisplay: 'Dinner', amount: '70.40', amountRaw: -70.40, type: 'expense', iconName: 'silverware-fork-knife', dateObject: new Date('2024-03-31T19:30:00'), detail: 'Dinner with friends' },
    { id: '6', title: 'Freelance Project', dateTime: '10:00 - March 15', categoryDisplay: 'Work', amount: '500.00', amountRaw: 500, type: 'income', iconName: 'briefcase-outline', dateObject: new Date('2024-03-15T10:00:00'), detail: 'Payment for freelance web design' },
];

export default dummyTransactions;