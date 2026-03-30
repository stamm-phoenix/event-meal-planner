export interface Subgroup {
  id: string;
  name: string;
  count: number;
}

export interface Ingredient {
  id: string;
  name: string;
  amountPerPerson: number;
  unit: string;
  category: string;
}

export interface Tool {
  id: string;
  name: string;
  responsiblePerson: string;
}

export interface GeneralIngredient {
  id: string;
  name: string;
  category: string;
}

export interface Dish {
  id: string;
  name: string;
  ingredients: Ingredient[];
  tools: Tool[];
  generalIngredients: GeneralIngredient[];
  baseServings: number;
  isFixedAmount?: boolean;
  notes?: string;
  links?: string[];
}

export interface MealBlock {
  id: string;
  day: string;
  time: string;
  label: string;
  mainDishIds: string[];
  subgroupDishes: Record<string, string[]>;
  isCompleted?: boolean;
  responsiblePerson?: string;
}

export interface MasterIngredient {
  id: string;
  name: string;
  unit: string;
  category: string;
}

export interface ShoppingListState {
  boughtAmounts: Record<string, number>;
  stores: Record<string, string>;
  boughtGeneralIngredients: Record<string, boolean>;
}

export interface Project {
  id: string;
  name: string;
  totalPeople: number;
  subgroups: Subgroup[];
  days: string[];
  startDate?: string;
  endDate?: string;
  mealBlocks: MealBlock[];
  dishes: Dish[];
  masterIngredients: MasterIngredient[];
  generalTools: Tool[];
  shoppingListState: ShoppingListState;
}

export interface ShoppingItem {
  name: string;
  amount: number;
  boughtAmount: number;
  unit: string;
  category: string;
  day?: string;
  dishName?: string;
  store?: string;
  sources: string[];
}

export interface LagerItem {
  name: string;
  amount: number;
  unit: string;
  category: string;
  day: string;
  dishName: string;
  store: string;
}

export interface LagerGroup {
  group: string;
  items: LagerItem[];
}

export interface GeneralShoppingItem {
  name: string;
  category: string;
  isBought: boolean;
}

export interface PackItem {
  name: string;
  responsiblePerson: string;
  source: string;
}

export interface PackGroup {
  person: string;
  items: PackItem[];
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function createNewProject(name: string = 'Neues Projekt'): Project {
  const startDate = new Date().toISOString().split('T')[0];
  const endDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const days: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    days.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return {
    id: generateId(),
    name,
    totalPeople: 20,
    startDate,
    endDate,
    subgroups: [
      { id: 'sg1', name: 'Vegetarier', count: 5 },
      { id: 'sg2', name: 'Veganer', count: 3 },
    ],
    days,
    mealBlocks: [
      { id: '1', day: days[0], time: '19:00', label: 'Abendessen', mainDishIds: [], subgroupDishes: {}, responsiblePerson: '' },
      { id: '2', day: days[1], time: '08:00', label: 'Frühstück', mainDishIds: [], subgroupDishes: {}, responsiblePerson: '' },
      { id: '3', day: days[1], time: '12:30', label: 'Mittagessen', mainDishIds: [], subgroupDishes: {}, responsiblePerson: '' },
      { id: '4', day: days[1], time: '15:30', label: 'Kaffee & Kuchen', mainDishIds: [], subgroupDishes: {}, responsiblePerson: '' },
      { id: '5', day: days[1], time: '19:00', label: 'Abendessen', mainDishIds: [], subgroupDishes: {}, responsiblePerson: '' },
      { id: '6', day: days[2], time: '08:30', label: 'Frühstück', mainDishIds: [], subgroupDishes: {}, responsiblePerson: '' },
      { id: '7', day: days[2], time: '12:30', label: 'Mittagessen', mainDishIds: [], subgroupDishes: {}, responsiblePerson: '' },
    ],
    dishes: [
      {
        id: 'd1',
        name: 'Käsespätzle',
        baseServings: 1,
        ingredients: [
          { id: 'i1', name: 'Spätzle', amountPerPerson: 150, unit: 'g', category: 'Teigwaren' },
          { id: 'i2', name: 'Käse', amountPerPerson: 50, unit: 'g', category: 'Kühlregal' },
          { id: 'i3', name: 'Zwiebeln', amountPerPerson: 0.5, unit: 'Stk', category: 'Gemüse' },
        ],
        tools: [],
        generalIngredients: [],
      },
      {
        id: 'd2',
        name: 'Grüner Salat',
        baseServings: 1,
        ingredients: [
          { id: 'i4', name: 'Salat', amountPerPerson: 0.25, unit: 'Kopf', category: 'Gemüse' },
        ],
        tools: [],
        generalIngredients: [],
      },
    ],
    masterIngredients: [
      { id: 'mi1', name: 'Spätzle', unit: 'g', category: 'Teigwaren' },
      { id: 'mi2', name: 'Käse', unit: 'g', category: 'Kühlregal' },
      { id: 'mi3', name: 'Zwiebeln', unit: 'Stk', category: 'Gemüse' },
      { id: 'mi4', name: 'Salat', unit: 'Kopf', category: 'Gemüse' },
    ],
    generalTools: [],
    shoppingListState: {
      boughtAmounts: {},
      stores: {},
      boughtGeneralIngredients: {},
    },
  };
}
