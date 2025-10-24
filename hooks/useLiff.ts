
import { useState, useEffect } from 'react';
import { LIFF_ID } from '../constants';
import type { LiffProfile } from '../types';

// Extend the Window interface to include liff
declare global {
    interface Window {
        liff: any;
    }
}

export const useLiff = () => {
    const [profile, setProfile] = useState<LiffProfile | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [liffStatus, setLiffStatus] = useState('🔄 初始化 LINE 功能中...');
    const [statusType, setStatusType] = useState<'info' | 'success' | 'warning'>('info');

    useEffect(() => {
        const initializeLiff = async () => {
            try {
                if (window.liff) {
                    await window.liff.init({ liffId: LIFF_ID });
                    if (window.liff.isLoggedIn()) {
                        setIsLoggedIn(true);
                        const userProfile = await window.liff.getProfile();
                        setProfile(userProfile);
                        setLiffStatus(`👋 歡迎，${userProfile.displayName}！`);
                        setStatusType('success');
                    } else {
                        if (window.liff.isInClient()) {
                            setLiffStatus('未登入 LINE，正在嘗試登入...');
                            window.liff.login();
                        } else {
                            setLiffStatus('請在 LINE App 中開啟以獲得完整功能。');
                            setStatusType('warning');
                        }
                    }
                } else {
                     throw new Error('LIFF SDK not found');
                }
            } catch (error) {
                console.error('LIFF initialization failed', error);
                setLiffStatus('⚠️ LINE 功能載入失敗，但您仍可訂餐。');
                setStatusType('warning');
            }
        };
        initializeLiff();
    }, []);

    return { profile, isLoggedIn, liffStatus, statusType };
};
