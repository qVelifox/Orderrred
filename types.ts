export interface FoodItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
}

export interface CartItem extends FoodItem {
  quantity: number;
}

export enum PaymentMethod {
  Cash = 'Espèces',
  PayPal = 'PayPal',
}

export interface OrderDetails {
  fullName: string;
  contactInfo: string;
  paymentMethod: PaymentMethod;
}