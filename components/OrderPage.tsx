import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { CartItem, OrderData, MenuItem } from '../types';
import { MENU_ITEMS, DELIVERY_FEE } from '../constants';
import { useLiff } from '../hooks/useLiff';
import { LoadingSpinner } from './LoadingSpinner';

interface OrderPageProps {
    onSubmitOrder: (orderData: Omit<OrderData, 'totalAmount' | 'orderId'>, lineUserId: string) => Promise<void>;
    showNotification: (message: string, type?: 'success' | 'error' | 'warning') => void;
    onViewHistory: () => void;
}

const getDefaultPickupTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    // Correct for timezone offset to get local time in YYYY-MM-DDTHH:mm format
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
};


export const OrderPage: React.FC<OrderPageProps> = ({ onSubmitOrder, showNotification, onViewHistory }) => {
    const { profile, liffStatus, statusType } = useLiff();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form State
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [pickupTime, setPickupTime] = useState(getDefaultPickupTime());
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [notes, setNotes] = useState('');

    // Validation State
    const [phoneError, setPhoneError] = useState('');
    const [timeError, setTimeError] = useState('');

    useEffect(() => {
        if (profile?.displayName) {
            setCustomerName(profile.displayName);
        }
    }, [profile]);

    const { subtotal, deliveryFee, totalAmount } = useMemo(() => {
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const currentDeliveryFee = deliveryAddress.trim() ? DELIVERY_FEE : 0;
        const totalAmount = subtotal + currentDeliveryFee;
        return { subtotal, deliveryFee: currentDeliveryFee, totalAmount };
    }, [cart, deliveryAddress]);

    const handleAddToCart = useCallback((itemName: string) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.name === itemName);
            if (existingItem) {
                return prevCart.map(item =>
                    item.name === itemName ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                const menuItem = MENU_ITEMS.find(item => item.name === itemName);
                if (menuItem) return [...prevCart, { ...menuItem, quantity: 1 }];
            }
            return prevCart;
        });
        showNotification(`已添加 ${itemName}`, 'success');
    }, [showNotification]);

    const handleQuantityChange = useCallback((itemName: string, change: number) => {
        setCart(prevCart => {
            const itemIndex = prevCart.findIndex(item => item.name === itemName);
            if (itemIndex === -1) return prevCart;
            
            const newQuantity = prevCart[itemIndex].quantity + change;
            if (newQuantity <= 0) {
                showNotification(`已移除 ${itemName}`, 'warning');
                return prevCart.filter(item => item.name !== itemName);
            }
            return prevCart.map(item =>
                item.name === itemName ? { ...item, quantity: newQuantity } : item
            );
        });
    }, [showNotification]);

    const validateForm = () => {
        let isValid = true;
        setPhoneError('');
        setTimeError('');

        if (!/^09\d{8}$/.test(customerPhone)) {
            setPhoneError('請輸入有效的10位手機號碼 (09開頭)');
            isValid = false;
        }

        const selectedTime = new Date(pickupTime);
        const now = new Date();
        const minTime = new Date(now.getTime() + 29 * 60000); // 29 mins buffer
        const maxTime = new Date(now.getTime() + 7 * 24 * 60 * 60000); // 7 days

        if (!pickupTime || selectedTime < minTime || selectedTime > maxTime) {
            setTimeError('請選擇有效的取餐時間 (30分鐘後至7天內)');
            isValid = false;
        }
        
        if (cart.length === 0) {
            showNotification('購物車是空的，請添加餐點', 'error');
            isValid = false;
        }
        return isValid;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setIsLoading(true);

        const orderData = {
            customerName,
            customerPhone,
            items: cart,
            pickupTime,
            deliveryAddress,
            notes,
        };

        try {
            await onSubmitOrder(orderData, profile?.userId || '');
        } catch (error) {
            // Error is already logged and notified by parent
        } finally {
            setIsLoading(false);
        }
    };

    const statusClasses = {
        info: 'bg-blue-100 border-blue-400 text-blue-800',
        success: 'bg-green-100 border-green-400 text-green-800',
        warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
    };

    return (
        <div className="animate-fade-in">
            <div className={`p-3 rounded-lg text-sm text-center border ${statusClasses[statusType]}`}>
                {liffStatus}
            </div>

            <button onClick={onViewHistory} className="w-full text-center p-2 border border-blue-500 text-blue-600 rounded-md text-sm hover:bg-blue-500 hover:text-white transition-colors duration-200 mt-4">🕒 查詢歷史訂單</button>
            
            <div className="space-y-4 mt-4">
                <div>
                    <label className="block mb-2 font-bold text-gray-700 text-sm">姓名 <span className="text-red-500">*</span></label>
                    <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="自動帶入 LINE 名稱" className="w-full p-3 border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:ring-green-500 focus:border-green-500"/>
                </div>
                <div>
                    <label className="block mb-2 font-bold text-gray-700 text-sm">手機號碼 <span className="text-red-500">*</span></label>
                    <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="0912345678" className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-green-500 focus:border-green-500 ${phoneError ? 'border-red-500' : 'border-gray-300'}`}/>
                    {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                </div>
                <div>
                    <label className="block mb-2 font-bold text-gray-700 text-sm">取餐時間 <span className="text-red-500">*</span></label>
                    <input type="datetime-local" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-green-500 focus:border-green-500 ${timeError ? 'border-red-500' : 'border-gray-300'}`}/>
                     {timeError && <p className="text-red-500 text-xs mt-1">{timeError}</p>}
                </div>
                <div>
                    <label className="block mb-2 font-bold text-gray-700 text-sm">外送地點 (選填)</label>
                    <input type="text" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="如需外送請填寫地址" className="w-full p-3 border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:ring-green-500 focus:border-green-500"/>
                    <p className="text-xs text-gray-500 mt-1 italic">{`※ 填寫地址將由後端計算 $${DELIVERY_FEE} 外送費`}</p>
                </div>
                <div>
                    <label className="block mb-2 font-bold text-gray-700 text-sm">備註 (選填)</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="例如：不要香菜、加辣等" className="w-full p-3 border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:ring-green-500 focus:border-green-500"></textarea>
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                <h2 className="text-center text-lg font-bold text-gray-800 mb-4 relative pb-2">📝 選擇餐點<span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-green-500 rounded-full"></span></h2>
                <select 
                    onChange={(e) => { if (e.target.value) handleAddToCart(e.target.value); e.target.value = ''; }} 
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm mb-4 focus:ring-green-500 focus:border-green-500"
                >
                    <option value="">-- 請選擇餐點 --</option>
                    {MENU_ITEMS.map(item => (
                        <option key={item.name} value={item.name}>
                            {item.icon} {item.name} - ${item.price}
                        </option>
                    ))}
                </select>
                <div className="p-3 bg-white rounded-md">
                    <p className="text-xs text-gray-500 mb-2">快速選擇：</p>
                    <div className="grid grid-cols-2 gap-2">
                        {MENU_ITEMS.slice(0, 4).map(item => (
                            <button key={item.name} onClick={() => handleAddToCart(item.name)} className="w-full text-left p-2 border border-green-500 text-green-600 rounded-md text-xs hover:bg-green-500 hover:text-white transition-colors duration-200">
                                {item.icon} {item.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
                <h2 className="text-center text-lg font-bold text-gray-800 mb-4 relative pb-2">🛒 訂單明細<span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-green-500 rounded-full"></span></h2>
                <div>
                    {cart.length === 0 ? (
                        <p className="text-center text-gray-500 py-4 italic">購物車是空的</p>
                    ) : (
                        cart.map(item => (
                            <div key={item.name} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                                <div>
                                    <p className="font-bold text-gray-800">{item.icon} {item.name}</p>
                                    <p className="text-xs text-gray-500">${item.price} x {item.quantity} = ${item.price * item.quantity}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleQuantityChange(item.name, -1)} className="w-7 h-7 bg-green-500 text-white rounded-full font-bold text-sm flex items-center justify-center hover:bg-green-600 transition-transform transform hover:scale-110">-</button>
                                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                                    <button onClick={() => handleQuantityChange(item.name, 1)} className="w-7 h-7 bg-green-500 text-white rounded-full font-bold text-sm flex items-center justify-center hover:bg-green-600 transition-transform transform hover:scale-110">+</button>
                                    <button onClick={() => handleQuantityChange(item.name, -item.quantity)} className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600 transition">移除</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-2 mt-4">
                <div className="flex justify-between text-sm text-gray-600"><span>餐點總計:</span><span>${subtotal}</span></div>
                <div className="flex justify-between text-sm text-gray-600"><span>外送費:</span><span>${deliveryFee}</span></div>
                <div className="flex justify-between font-bold text-lg text-gray-800 border-t border-gray-300 pt-3 mt-3"><span>預估總金額:</span><span>${totalAmount}</span></div>
            </div>
            
            <div className="mt-6">
                <button onClick={handleSubmit} disabled={cart.length === 0 || isLoading} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center">
                    {isLoading ? <LoadingSpinner /> : <span>✅ 送出訂單</span>}
                </button>
            </div>
        </div>
    );
};