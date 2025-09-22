// 移动端事件处理优化

class MobileTouchHandler {
    constructor(editor) {
        this.editor = editor;
        this.touchStartTime = 0;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.longPressTimer = null;
        
        this.initTouchEvents();
    }

    initTouchEvents() {
        const elements = document.querySelectorAll('.editable-element');
        
        elements.forEach(element => {
            // 移除原有的双击事件
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
            
            // 添加触摸事件
            this.addTouchEvents(newElement);
        });
    }

    addTouchEvents(element) {
        // 触摸开始
        element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchStartTime = Date.now();
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            
            // 立即选中元素（点击任何位置都可以编辑）
            this.editor.selectElement(element);
            this.showEditIndicator(element);
            
            // 长按触发深度编辑（保持原有功能）
            this.longPressTimer = setTimeout(() => {
                this.showEditIndicator(element);
            }, 500);
        }, { passive: false });

        // 触摸移动
        element.addEventListener('touchmove', (e) => {
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
            
            // 检查是否是滑动（避免误触发点击）
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const deltaX = Math.abs(currentX - this.touchStartX);
            const deltaY = Math.abs(currentY - this.touchStartY);
            
            if (deltaX > 10 || deltaY > 10) {
                // 滑动操作，取消长按
                if (this.longPressTimer) {
                    clearTimeout(this.longPressTimer);
                    this.longPressTimer = null;
                }
            }
        }, { passive: false });

        // 触摸结束
        element.addEventListener('touchend', (e) => {
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
            
            const touchDuration = Date.now() - this.touchStartTime;
            const currentX = e.changedTouches[0].clientX;
            const currentY = e.changedTouches[0].clientY;
            const deltaX = Math.abs(currentX - this.touchStartX);
            const deltaY = Math.abs(currentY - this.touchStartY);
            
            // 短按（轻点） - 保持选中状态（已在前面的touchstart中处理）
            if (touchDuration < 300 && deltaX < 10 && deltaY < 10) {
                // 已经在前面的touchstart中选中，这里不需要额外操作
            }
        }, { passive: false });

        // 触摸取消
        element.addEventListener('touchcancel', () => {
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
        }, { passive: false });
    }

    showEditIndicator(element) {
        // 显示编辑指示器
        element.style.boxShadow = '0 0 0 3px #667eea';
        setTimeout(() => {
            element.style.boxShadow = '';
        }, 1000);
    }

    showSelectionIndicator(element) {
        // 显示选中指示器
        element.style.outline = '2px solid #4CAF50';
        setTimeout(() => {
            element.style.outline = '';
        }, 1000);
    }

    // 移动端打印优化
    static optimizePrintForMobile() {
        const style = document.createElement('style');
        style.textContent = `
            /* 移动端打印优化 */
            @media print {
                /* 隐藏所有非模板内容 */
                body > *:not(.template-container) {
                    display: none !important;
                }
                
                /* 确保模板容器正确显示 */
                .template-container {
                    display: block !important;
                    width: 100% !important;
                    height: auto !important;
                    position: relative !important;
                    left: 0 !important;
                    top: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    background: white !important;
                    box-shadow: none !important;
                    border: none !important;
                }
                
                /* 确保所有元素可见 */
                .template-container * {
                    visibility: visible !important;
                    display: block !important;
                    opacity: 1 !important;
                }
                
                /* 可编辑元素优化 */
                .editable-element {
                    position: static !important;
                    margin: 8px 0 !important;
                    padding: 5px !important;
                    border: 1px solid #ccc !important;
                    background: white !important;
                    color: black !important;
                    font-size: 14px !important;
                    line-height: 1.4 !important;
                }
                
                /* 文本元素优化 */
                .text-element {
                    white-space: pre-wrap !important;
                    word-break: break-all !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                /* 图片元素优化 */
                .image-element {
                    max-width: 100% !important;
                    height: auto !important;
                    border: 1px solid #000 !important;
                }
                
                /* 确保所有文字黑色 */
                * {
                    color: #000000 !important;
                    background-color: transparent !important;
                }
                
                /* 移除所有动画和过渡 */
                * {
                    animation: none !important;
                    transition: none !important;
                }
            }
            
            /* 移动端打印按钮样式 */
            @media (max-width: 768px) {
                #print {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                    border: none !important;
                    color: white !important;
                    padding: 12px 20px !important;
                    border-radius: 8px !important;
                    font-size: 16px !important;
                    font-weight: bold !important;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4) !important;
                    cursor: pointer !important;
                    transition: all 0.3s ease !important;
                }
                
                #print:active {
                    transform: translateY(2px) !important;
                    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.6) !important;
                }
            }
        `;
        document.head.appendChild(style);
        
        // 添加移动端打印事件监听
        this.addMobilePrintListener();
    }
    
    // 添加移动端打印事件监听
    static addMobilePrintListener() {
        const printButton = document.getElementById('print');
        if (printButton) {
            printButton.addEventListener('click', function() {
                // 在移动端显示打印提示
                if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                    alert('请使用浏览器的分享功能，然后选择"打印"选项。\n\n在iOS Safari中：\n1. 点击分享按钮\n2. 滑动找到"打印"\n3. 选择打印机或保存为PDF\n\n在Android Chrome中：\n1. 点击菜单按钮\n2. 选择"分享"\n3. 选择"打印"');
                }
                
                // 触发标准打印
                setTimeout(() => {
                    window.print();
                }, 100);
            });
        }
    }
}

// 移动端输入优化
function optimizeMobileInputs() {
    // 防止iOS缩放
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            document.body.style.zoom = '1';
        });
        
        input.addEventListener('blur', () => {
            document.body.style.zoom = '';
        });
    });
}

// 移动端初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检测移动设备
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
        // 添加移动端优化
        optimizeMobileInputs();
        MobileTouchHandler.optimizePrintForMobile();
        
        console.log('移动端优化已启用');
    }
});