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
            
            // 长按触发编辑
            this.longPressTimer = setTimeout(() => {
                this.editor.selectElement(element);
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
            
            // 短按（点击） - 选中元素
            if (touchDuration < 300 && deltaX < 10 && deltaY < 10) {
                this.editor.selectElementWithoutPanel(element);
                this.showSelectionIndicator(element);
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
            @media print {
                body * {
                    visibility: hidden;
                }
                .template-container,
                .template-container * {
                    visibility: visible;
                }
                .template-container {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
                .editable-element {
                    position: static !important;
                    margin: 10px 0 !important;
                }
            }
        `;
        document.head.appendChild(style);
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