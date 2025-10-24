
import React, { useMemo } from 'react';
import type { OrderData } from '../types';

interface SuccessPageProps {
    orderData: OrderData;
    onNewOrder: () => void;
    showNotification: (message: string, type?: 'success' | 'error' | 'warning') => void;
}

const formatDisplayTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const formatOrderItems = (items: OrderData['items']) => {
    return items.map(item => `${item.icon} ${item.name} x${item.quantity} ($${item.price * item.quantity})`).join(', ');
};

export const SuccessPage: React.FC<SuccessPageProps> = ({ orderData, onNewOrder, showNotification }) => {
    
    const shareTextContent = useMemo(() => {
        const itemsText = orderData.items.map(item => `▫️ ${item.icon} ${item.name} x${item.quantity} - $${item.price * item.quantity}`).join('\n');
        return `🍽️ 台灣小吃店 - 訂單確認\n\n📋 訂單編號：${orderData.orderId}\n👤 顧客姓名：${orderData.customerName}\n📞 聯絡電話：${orderData.customerPhone}\n\n📦 訂單內容：\n${itemsText}\n\n💰 最終總金額：$${orderData.totalAmount}\n⏰ 取餐時間：${formatDisplayTime(orderData.pickupTime)}\n📍 ${orderData.deliveryAddress ? `外送地址：${orderData.deliveryAddress}` : '自取'}\n📝 備註：${orderData.notes || '無'}\n\n📍 取餐地址：台灣小吃店\n🕒 營業時間：10:00-21:00\n📞 聯絡電話：02-1234-5678`;
    }, [orderData]);

    const lineShareHref = `https://line.me/R/msg/text/?${encodeURIComponent(shareTextContent)}`;

    const copyShareText = () => {
        navigator.clipboard.writeText(shareTextContent)
            .then(() => showNotification('訂單資訊已複製！', 'success'))
            .catch(err => {
                console.error('Copy failed', err);
                showNotification('複製失敗', 'error');
            });
    };

    return (
        <div className="text-center p-5 animate-fade-in">
            <div className="text-6xl mb-5">✅</div>
            <h3 className="text-2xl font-bold text-green-600 mb-4">訂單提交成功！</h3>

            <div className="bg-gray-50 p-4 rounded-lg my-5 text-left border">
                <p><strong>訂單編號：</strong><span>{orderData.orderId}</span></p>
                <p><strong>顧客姓名：</strong><span>{orderData.customerName}</span></p>
                <p><strong>最終總金額：</strong>$<span>{orderData.totalAmount}</span></p>
                <p><strong>取餐時間：</strong><span>{formatDisplayTime(orderData.pickupTime)}</span></p>
                <p><strong>訂單內容：</strong><span>{formatOrderItems(orderData.items)}</span></p>
            </div>

            <div className="my-8">
                <p className="text-lg font-bold mb-4">📱 分享訂單資訊</p>
                <p className="text-sm text-gray-600 mb-4">點擊下方按鈕將訂單資訊分享到 LINE：</p>
                <a href={lineShareHref} target="_blank" rel="noopener noreferrer" className="inline-block my-4 p-2.5 bg-[#06c755] rounded-lg">
                    <img src="https://scdn.line-apps.com/n/line_add_friends/btn/zh-Hant.png" alt="分享到 LINE" className="h-10" />
                </a>
                <div className="mt-6">
                    <p className="text-sm text-gray-600 mb-2">或複製以下訂單資訊：</p>
                    <div className="my-4">
                        <textarea readOnly value={shareTextContent} rows={6} className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-gray-100"></textarea>
                        <button onClick={copyShareText} className="bg-blue-500 text-white border-none py-2 px-5 rounded-md cursor-pointer mt-2.5 hover:bg-blue-600">📋 複製訂單資訊</button>
                    </div>
                </div>
            </div>
            <div className="mt-6">
                <button onClick={onNewOrder} className="bg-green-600 text-white border-none py-3 px-8 rounded-md cursor-pointer text-base mt-5 hover:bg-green-700">📝 再訂一單</button>
            </div>
        </div>
    );
};
