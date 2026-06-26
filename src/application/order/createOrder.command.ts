export interface CreateOrderCommand {
  customer: {
    name: string;
    phone: string;
    address: string;
    deliveryMethod: "delivery" | "pickup";
  };
  items: Array<{
    id: string;
    title: string;
    imageUrl: string;
    size: string;
    price: number;
    quantity: number;
  }>;
}
