import React, { useState, useCallback, useEffect } from 'react';
import { OrderPage } from './components/OrderPage';
import { SuccessPage } from './components/SuccessPage';
import { Notification } from './components/Notification';
import type { OrderData, NotificationState, OrderHistoryItem } from './types';
import { API_ENDPOINT } from './constants';
import { submitOrder as apiSubmitOrder, getOrders } from './services/apiService';
import { useLiff } from './hooks/useLiff';

interface HistoryPageProps {
    onBack: () => void;
    showNotification: (message: string, type?: 'success' | 'error' | 'warning') => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onBack, showNotification }) => {
    const { profile } = useLiff();
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [customerPhone, setCustomerPhone] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        setPhoneError('');
        const isPhoneValid = /^09\d{8}$/.test(customerPhone);

        if (!customerPhone && !profile?.userId) {
            showNotification('請輸入手機號碼，或在 LINE App 中開啟以查詢。', 'error');
            return;
        }

        if (customerPhone && !isPhoneValid) {
            setPhoneError('請輸入有效的10位手機號碼 (09開頭)');
            return;
        }
        
        setIsLoading(true);
        setSearched(true);
        setOrders([]);
        
        try {
            const result = await getOrders(API_ENDPOINT, { 
                customerPhone: customerPhone,
                lineUserId: profile?.userId,
                startDate: startDate,
                endDate: endDate
            });
            if (result.success && Array.isArray(result.data)) {
                setOrders(result.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            } else {
                throw new Error(result.message || '查詢失敗');
            }
        } catch (error) {
            showNotification(`查詢失敗，請稍後再試。`, 'error');
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatItems = (items: string) => {
        return typeof items === 'string' ? items : '項目資訊錯誤';
    };

    return (
        <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">訂單紀錄查詢</h2>
                <button onClick={onBack} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded-lg">返回訂餐</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg border">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">手機號碼查詢</label>
                    <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="0912345678" className={`w-full p-2 border rounded-md ${phoneError ? 'border-red-500' : 'border-gray-300'}`} />
                    {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                    <p className="text-xs text-gray-500 mt-1 italic">若您未使用 LINE 登入，請使用手機號碼查詢。</p>
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">開始日期</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">結束日期</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                </div>
                <div className="md:col-span-2">
                    <button onClick={handleSearch} disabled={isLoading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 flex items-center justify-center">
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>查詢中...</span>
                            </>
                        ) : '🔍 查詢'}
                    </button>
                </div>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
                {!isLoading && !searched && (
                    <div className="text-center text-gray-500 py-10 italic">
                        <p>請輸入手機號碼或使用 LINE 登入後，</p>
                        <p>選擇日期範圍進行查詢。</p>
                    </div>
                )}
                {!isLoading && searched && orders.length === 0 && (
                    <p className="text-center text-gray-500 py-10 italic">找不到符合條件的訂單</p>
                )}
                {!isLoading && orders.map(order => (
                    <div key={order.orderId} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                        <div className="flex justify-between items-start border-b pb-2 mb-2">
                            <div>
                                <p className="text-xs text-gray-500">訂單編號</p>
                                <p className="font-bold text-gray-800 text-sm">{order.orderId}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">訂單金額</p>
                                <p className="font-bold text-green-600 text-lg">${order.totalAmount}</p>
                            </div>
                        </div>
                        <div className="text-sm space-y-1 text-gray-600">
                            <p><strong>下單時間:</strong> {new Date(order.createdAt).toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                            <p><strong>預計取餐:</strong> {new Date(order.pickupTime).toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                            <p><strong>訂單內容:</strong> {formatItems(order.items)}</p>
                            {order.deliveryAddress && <p><strong>外送地址:</strong> {order.deliveryAddress}</p>}
                            {order.notes && <p><strong>備註:</strong> {order.notes}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [view, setView] = useState<'order' | 'success' | 'history'>('order');
    const [submittedOrder, setSubmittedOrder] = useState<OrderData | null>(null);
    const [notification, setNotification] = useState<NotificationState>({ message: '', type: 'success', visible: false });

    useEffect(() => {
        // --- Security Enhancement: Developer Console Warning ---
        console.log(
            "%cSTOP!",
            "color: red; font-size: 48px; font-weight: bold; -webkit-text-stroke: 1px black;"
        );
        console.log(
            "%cThis is a browser feature intended for developers. If someone told you to copy-paste something here to enable a feature or 'hack' this system, it is a scam.",
            "font-size: 18px;"
        );
         console.log(
            "%cThis ordering system is proprietary. Unauthorized copying, distribution, or use of this code is strictly prohibited.",
            "font-size: 16px; font-weight: bold; color: #888;"
        );
    }, []);

    const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success', duration: number = 4000) => {
        setNotification({ message, type, visible: true });
        setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), duration);
    }, []);

    const handleSubmitOrder = async (orderData: Omit<OrderData, 'totalAmount' | 'orderId'>, lineUserId: string): Promise<void> => {
        try {
            const result = await apiSubmitOrder(API_ENDPOINT, orderData, lineUserId);
            if (result.success) {
                const finalOrderData: OrderData = {
                    ...orderData,
                    orderId: result.data?.orderId || 'N/A',
                    totalAmount: result.data.totalAmount,
                };
                setSubmittedOrder(finalOrderData);
                setView('success');

                // Send LIFF message if possible
                if (lineUserId && window.liff && window.liff.isInClient()) {
                    const itemsText = orderData.items.map(item => `${item.icon} ${item.name} x${item.quantity}`).join('\n');
                    const formattedTime = new Date(orderData.pickupTime).toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                    await window.liff.sendMessages([{ 
                        type: 'text', 
                        text: `感謝訂購！\n\n📋 訂單編號：${finalOrderData.orderId}\n👤 顧客姓名：${orderData.customerName}\n\n📦 訂單內容：\n${itemsText}\n\n💰 總金額：$${finalOrderData.totalAmount}\n⏰ 取餐時間：${formattedTime}` 
                    }]);
                }
            } else {
                throw new Error(result.message || '訂單提交失敗');
            }
        } catch (error) {
            console.error('Order submission error:', error);
            showNotification('訂單提交失敗，請檢查您的網路連線後再試一次。', 'error');
            throw error; // Re-throw to allow component to handle loading state
        }
    };

    const handleNewOrder = () => {
        setSubmittedOrder(null);
        setView('order');
    };
    
    const renderContent = () => {
        switch(view) {
            case 'history':
                return <HistoryPage onBack={() => setView('order')} showNotification={showNotification} />;
            case 'success':
                return submittedOrder && <SuccessPage orderData={submittedOrder} onNewOrder={handleNewOrder} showNotification={showNotification} />;
            case 'order':
            default:
                return <OrderPage onSubmitOrder={handleSubmitOrder} showNotification={showNotification} onViewHistory={() => setView('history')} />;
        }
    }

    return (
        <div className="p-4 min-h-screen flex items-center justify-center">
            <div className="container max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-[#fff3cd] border border-[#ffeaa7] rounded-t-2xl p-2.5 text-xs text-center text-[#856404]">
                    🔒 安全訂餐系統 - 24小時接受預訂
                </div>

                <header className="bg-green-500 text-white p-5 text-center relative">
                    <h1 className="text-2xl font-bold mb-1">🍜 台灣小吃店</h1>
                    <p className="text-sm opacity-90">LINE 快速訂餐 - 24小時服務</p>
                    <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-white bg-opacity-30 rounded-full"></div>
                </header>

                <main className="p-5 space-y-4">
                    <Notification
                        message={notification.message}
                        type={notification.type}
                        visible={notification.visible}
                        onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
                    />
                    {renderContent()}
                </main>

                <footer className="bg-gray-100 p-4 text-center text-xs text-gray-500 border-t border-gray-200">
                    <p>📍 營業時間: 10:00 - 21:00 | 📞 聯絡電話: 02-1234-5678</p>
                    <p className="mt-2 opacity-70">系統版本: 8.3.0-SECURE (React)</p>
                    <p className="mt-1 opacity-50">&copy; {new Date().getFullYear()} 台灣小吃店. All Rights Reserved.</p>
                </footer>
            </div>
        </div>
    );
};

export default App;