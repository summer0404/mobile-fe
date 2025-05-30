import { Transaction as ApiTransaction, TransactionType as ApiUITransactionType } from '@/services/transactionsService';
import { TransactionItemData as AllTransactionsItemData, TransactionTypeId as LocalUITransactionType } from '@/components/addTransaction/types'; // Renaming to avoid confusion
import numeral from 'numeral';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- Existing mapApiTransactionToUi for AllTransactionsScreen ---
const getIconForApiType = (type: ApiUITransactionType): keyof typeof MaterialCommunityIcons.glyphMap => {
    switch (type) {
        case 'income': return 'cash-plus';
        case 'food': return 'food-fork-drink';
        case 'transport': return 'train-car';
        case 'shopping': return 'cart-outline';
        case 'bill': return 'receipt';
        case 'entertainment': return 'movie-outline';
        case 'health': return 'heart-pulse';
        case 'education': return 'school-outline';
        case 'groceries': return 'basket-outline';
        case 'beauty': return 'face-woman-shimmer-outline';
        case 'vacation': return 'airplane';
        case 'home': return 'home-outline';
        case 'borrow': return 'cash-minus';
        case 'lend': return 'cash-plus';
        case 'other': return 'shape-outline';
        default: return 'help-circle-outline';
    }
};

export const mapApiTransactionToUi = (apiTransaction: ApiTransaction): AllTransactionsItemData => {
    const dateObject = new Date(apiTransaction.date);
    const uiType: LocalUITransactionType = (apiTransaction.type === 'income' || apiTransaction.type === 'lend') ? 'income' : 'expense';

    return {
        id: String(apiTransaction.id),
        title: apiTransaction.name,
        dateTime: dateObject.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + dateObject.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        categoryDisplay: apiTransaction.type.charAt(0).toUpperCase() + apiTransaction.type.slice(1),
        amount: numeral(apiTransaction.amount).format('0,0.00'),
        amountRaw: (apiTransaction.type === 'income' || apiTransaction.type === 'lend') ? apiTransaction.amount : -Math.abs(apiTransaction.amount),
        type: uiType,
        iconName: getIconForApiType(apiTransaction.type),
        dateObject: dateObject,
        detail: apiTransaction.detail || '',
        originalApiType: apiTransaction.type,
    };
};

// --- New type and mapping function for Home Screen Transaction List ---
export interface HomeTransactionListItem {
  id: number | string;
  title: string;
  time: string;
  category: string; // This will be the API type, capitalized
  type: 'income' | 'expense'; // Simplified for UI color coding
  amount: string; // Formatted amount
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string; // Tailwind class for background
  iconTextColor: string; // Tailwind class for icon color
}

const getHomeIconStyle = (apiType: ApiUITransactionType, amount: number): { icon: keyof typeof MaterialCommunityIcons.glyphMap, iconColor: string, iconTextColor: string, uiType: 'income' | 'expense' } => {
    const isIncomeLike = apiType === 'income' || apiType === 'lend';
    const uiType = isIncomeLike ? 'income' : 'expense';
    let iconName = getIconForApiType(apiType); // Reuse existing icon logic

    // Default styles
    let iconColor = 'bg-slate-100';
    let iconTextColor = 'text-slate-600';

    if (uiType === 'income') {
        iconColor = 'bg-green-100';
        iconTextColor = 'text-green-600';
    } else { // Expense types
        switch (apiType) {
            case 'food':
            case 'groceries':
                iconColor = 'bg-orange-100';
                iconTextColor = 'text-orange-600';
                break;
            case 'transport':
                iconColor = 'bg-blue-100';
                iconTextColor = 'text-blue-600';
                break;
            case 'shopping':
                iconColor = 'bg-purple-100';
                iconTextColor = 'text-purple-600';
                break;
            case 'bill':
            case 'home':
                iconColor = 'bg-yellow-100';
                iconTextColor = 'text-yellow-600';
                break;
            case 'entertainment':
                iconColor = 'bg-pink-100';
                iconTextColor = 'text-pink-600';
                break;
            case 'health':
                iconColor = 'bg-red-100';
                iconTextColor = 'text-red-600';
                break;
            // Add more specific cases if needed
            default: // General expense
                iconColor = 'bg-gray-100';
                iconTextColor = 'text-gray-600';
                break;
        }
    }

    return { icon: iconName, iconColor, iconTextColor, uiType };
};

export const mapApiTransactionToHomeListItem = (apiTransaction: ApiTransaction): HomeTransactionListItem => {
  const dateObject = new Date(apiTransaction.date);
  const { icon, iconColor, iconTextColor, uiType } = getHomeIconStyle(apiTransaction.type, apiTransaction.amount);

  return {
    id: apiTransaction.id,
    title: apiTransaction.name,
    time: dateObject.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    category: apiTransaction.type.charAt(0).toUpperCase() + apiTransaction.type.slice(1),
    type: uiType,
    amount: numeral(apiTransaction.amount).format('0,0.00'),
    icon: icon,
    iconColor: iconColor,
    iconTextColor: iconTextColor,
  };
};