import type { OrderData, ApiSubmitResponse, CartItem, ApiGetOrdersResponse } from '../types';
import { API_KEY } from '../constants';

export const submitOrder = async (
    apiEndpoint: string,
    orderData: Omit<OrderData, 'totalAmount' | 'orderId'>,
    lineUserId: string
): Promise<ApiSubmitResponse> => {
    const orderDataForServer = {
        customerName: orderData.customerName.trim(),
        customerPhone: orderData.customerPhone.trim(),
        customerLineUserId: lineUserId || 'Not-Bound',
        // IMPORTANT: Only send name and quantity. Price is determined by the server.
        items: orderData.items.map((item: CartItem) => ({ name: item.name, quantity: item.quantity })),
        pickupTime: orderData.pickupTime,
        deliveryAddress: orderData.deliveryAddress.trim(),
        notes: orderData.notes.trim(),
        timestamp: new Date().toISOString(),
    };

    const payload = { action: 'createOrder', orderData: orderDataForServer };

    const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 
            'Content-Type': 'text/plain;charset=utf-8',
            'X-Api-Key': API_KEY 
        },
        body: JSON.stringify(payload),
        mode: 'cors',
    });

    if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    const result: ApiSubmitResponse = await response.json();
    return result;
};

export const getOrders = async (
    apiEndpoint: string,
    params: { customerPhone: string; lineUserId?: string; startDate: string; endDate: string; }
): Promise<ApiGetOrdersResponse> => {
    const payload = {
        action: 'getOrders',
        ...params
    };
    const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 
            'Content-Type': 'text/plain;charset=utf-8',
            'X-Api-Key': API_KEY
        },
        body: JSON.stringify(payload),
        mode: 'cors',
    });
    if (!response.ok) {
        throw new Error(`伺服器錯誤: ${response.status} ${response.statusText}`);
    }
    const result: ApiGetOrdersResponse = await response.json();
    return result;
};