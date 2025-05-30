import { Category, CategoryGroupData } from "@/components/addTransaction/types";

const allCategoriesData: CategoryGroupData[] = [
  {
    groupName: 'Living expenses',
    items: [
      { id: 'food', name: 'Food', icon: 'silverware-fork-knife', iconColor: 'text-orange-500', bgColor: 'bg-orange-100' },
      { id: 'groceries', name: 'Groceries', icon: 'cart-outline', iconColor: 'text-green-500', bgColor: 'bg-green-100' },
      { id: 'transport', name: 'Transport', icon: 'car-outline', iconColor: 'text-blue-500', bgColor: 'bg-blue-100' },
    ],
  },
  {
    groupName: 'Incidental expenses',
    items: [
      { id: 'shopping', name: 'Shopping', icon: 'shopping-outline', iconColor: 'text-pink-500', bgColor: 'bg-pink-100' },
      { id: 'entertainment', name: 'Entertainment', icon: 'movie-open-outline', iconColor: 'text-purple-500', bgColor: 'bg-purple-100' },
    ],
  },
  {
    groupName: 'Fixed expenses',
    items: [
      { id: 'bills', name: 'Bills', icon: 'receipt', iconColor: 'text-indigo-500', bgColor: 'bg-indigo-100' },
      { id: 'home', name: 'Home', icon: 'home-outline', iconColor: 'text-amber-500', bgColor: 'bg-amber-100' },
    ],
  },
];

const suggestedCategoriesData: Category[] = allCategoriesData[0]?.items.slice(0, 3) || [];

export default {
  allCategoriesData: allCategoriesData,
  suggestedCategoriesData: suggestedCategoriesData,
};