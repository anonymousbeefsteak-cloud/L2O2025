export interface MenuItem {
    name: string;
    price: number;
    icon: string;
}

export interface CartItem extends MenuItem {
    quantity: number;
}

export interface OrderData {
    customerName: string;
    customerPhone: string;
    items: CartItem[];
    pickupTime: string;
    deliveryAddress: string;
    notes: string;
    totalAmount: number;
    orderId: string;
}

export interface LiffProfile {
    userId: string;
    displayName: string;
    pictureUrl?: string;
    statusMessage?: string;
}

export interface NotificationState {
    message: string;
    type: 'success' | 'error' | 'warning';
    visible: boolean;
}

export interface ApiSubmitResponse {
    success: boolean;
    message?: string;
    data?: {
        orderId: string;
        totalAmount: number;
    };
    error?: string;
}

export interface OrderHistoryItem {
    orderId: string;
    customerName: string;
    customerPhone: string;
    lineUserId: string;
    items: string; 
    subtotal: number;
    deliveryFee: number;
    totalAmount: number;
    pickupTime: string;
    deliveryAddress: string;
    notes: string;
    status: string;
    createdAt: string;
    adminNotes: string;
}

export interface ApiGetOrdersResponse {
    success: boolean;
    data?: OrderHistoryItem[];
    message?: string;
    error?: string;
}
