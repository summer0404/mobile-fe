import { Category, CategoryGroupData } from "@/components/addTransaction/types";

const allCategoriesData: CategoryGroupData[] = [
  {
    groupName: 'Living & Essentials',
    items: [
      { id: 'food', name: 'Food', icon: 'silverware-fork-knife', iconColor: 'text-orange-500', bgColor: 'bg-orange-100' },
      { id: 'groceries', name: 'Groceries', icon: 'cart-outline', iconColor: 'text-green-500', bgColor: 'bg-green-100' },
      { id: 'transport', name: 'Transport', icon: 'car-outline', iconColor: 'text-blue-500', bgColor: 'bg-blue-100' },
      { id: 'health', name: 'Health', icon: 'heart-pulse', iconColor: 'text-red-500', bgColor: 'bg-red-100' },
      { id: 'education', name: 'Education', icon: 'school-outline', iconColor: 'text-cyan-500', bgColor: 'bg-cyan-100' },
    ],
  },
  {
    groupName: 'Discretionary & Lifestyle',
    items: [
      { id: 'shopping', name: 'Shopping', icon: 'shopping-outline', iconColor: 'text-pink-500', bgColor: 'bg-pink-100' },
      { id: 'entertainment', name: 'Entertainment', icon: 'movie-open-outline', iconColor: 'text-purple-500', bgColor: 'bg-purple-100' },
      { id: 'beauty', name: 'Beauty', icon: 'lipstick', iconColor: 'text-rose-500', bgColor: 'bg-rose-100' },
      { id: 'vacation', name: 'Vacation', icon: 'airplane-takeoff', iconColor: 'text-teal-500', bgColor: 'bg-teal-100' },
    ],
  },
  {
    groupName: 'Fixed & Home',
    items: [
      { id: 'bill', name: 'Bill', icon: 'receipt', iconColor: 'text-indigo-500', bgColor: 'bg-indigo-100' }, // Changed id to 'bill' and name to 'Bill'
      { id: 'home', name: 'Home', icon: 'home-outline', iconColor: 'text-amber-500', bgColor: 'bg-amber-100' },
    ],
  },
  {
    groupName: 'Miscellaneous',
    items: [
      { id: 'other', name: 'Other', icon: 'dots-horizontal-circle-outline', iconColor: 'text-gray-500', bgColor: 'bg-gray-100' },
    ],
  }
];

// Update suggestedCategoriesData if needed, e.g., to pick from the new set or keep as is
const suggestedCategoriesData: Category[] = [
    ...allCategoriesData[0].items.slice(0, 2), // e.g., Food, Groceries
    allCategoriesData[1].items[0], // e.g., Shopping
].slice(0,3); // Ensure only 3 items

export default {
  allCategoriesData: allCategoriesData,
  suggestedCategoriesData: suggestedCategoriesData,
};