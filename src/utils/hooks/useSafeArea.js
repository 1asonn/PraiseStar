import { useEffect, useState } from 'react';

export const useSafeArea = () => {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  });

  useEffect(() => {
    const updateSafeArea = () => {
      // 创建测试元素来获取CSS环境变量
      const testDiv = document.createElement('div');
      testDiv.style.cssText = `
        position: fixed;
        top: env(safe-area-inset-top);
        right: env(safe-area-inset-right);
        bottom: env(safe-area-inset-bottom);
        left: env(safe-area-inset-left);
        visibility: hidden;
        pointer-events: none;
      `;
      document.body.appendChild(testDiv);
      
      const computedStyle = getComputedStyle(testDiv);
      const top = parseInt(computedStyle.top) || 0;
      const right = parseInt(computedStyle.right) || 0;
      const bottom = parseInt(computedStyle.bottom) || 0;
      const left = parseInt(computedStyle.left) || 0;
      
      document.body.removeChild(testDiv);
      
      console.log("SafeArea values:", { top, right, bottom, left });
      setSafeArea({ top, right, bottom, left });
    };

    updateSafeArea();

    // 监听视口变化
    window.addEventListener('resize', updateSafeArea);
    window.addEventListener('orientationchange', updateSafeArea);

    return () => {
      window.removeEventListener('resize', updateSafeArea);
      window.removeEventListener('orientationchange', updateSafeArea);
    };
  }, []);

  return safeArea;
};

// 检测是否为Safari移动端
export const isSafariMobile = () => {
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const webkit = /WebKit/.test(ua);
  const chrome = /CriOS|Chrome/.test(ua);
  return iOS && webkit && !chrome;
};

// 动态设置视口高度
export const useViewportHeight = () => {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    const updateHeight = () => {
      // 使用visualViewport API（如果可用）
      if (window.visualViewport) {
        console.log("window.visualViewport", window.visualViewport);
        setViewportHeight(window.visualViewport.height);
      } else {
        setViewportHeight(window.innerHeight);
      }
    };

    updateHeight();

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateHeight);
      return () => window.visualViewport?.removeEventListener('resize', updateHeight);
    } else {
      window.addEventListener('resize', updateHeight);
      return () => window.removeEventListener('resize', updateHeight);
    }
  }, []);

  return viewportHeight;
};

export const useAddSafeBottom = (bottomOffset = 0) => {
  const [cleanup, setCleanup] = useState(null);
  
  const applyToElement = (targetDom) => {
    if (!targetDom) return;
    
    // 清理之前的监听器
    if (cleanup) {
      cleanup();
    }
    
    const cleanupFn = AddSafeBottom(targetDom, bottomOffset);
    setCleanup(() => cleanupFn);
  };
  
  useEffect(() => {
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [cleanup]);
  
  return applyToElement;
}; 

// 添加安全底部（safari移动端）
export const AddSafeBottom = (targetDom, bottomOffset) => {
    // 检查是否为移动端（768px以下）
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return () => {};
    
    const isSafari = isSafariMobile();
    
    if (isSafari) {
        // Safari环境：添加底部内边距
        targetDom.style.paddingBottom = `${bottomOffset}px`;
    } else {
        // 非Safari环境：设置100dvh高度
        targetDom.style.height = '100dvh';
        targetDom.style.minHeight = '100dvh';
    }
    
    // 监听窗口大小变化，动态调整
    const handleResize = () => {
        const currentIsMobile = window.innerWidth <= 768;
        
        if (!currentIsMobile) {
            // 桌面端：清除移动端样式
            targetDom.style.paddingBottom = '';
            targetDom.style.height = '';
            targetDom.style.minHeight = '';
        } else {
            // 移动端：重新应用样式
            if (isSafari) {
                targetDom.style.paddingBottom = `${bottomOffset}px`;
                targetDom.style.height = '';
                targetDom.style.minHeight = '';
            } else {
                targetDom.style.paddingBottom = '';
                targetDom.style.height = '100dvh';
                targetDom.style.minHeight = '100dvh';
            }
        }
    };
    
    window.addEventListener('resize', handleResize);
    
    // 返回清理函数
    return () => {
        window.removeEventListener('resize', handleResize);
        targetDom.style.paddingBottom = '';
        targetDom.style.height = '';
        targetDom.style.minHeight = '';
    };
};
