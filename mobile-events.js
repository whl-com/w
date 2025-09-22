// 移动端事件处理优化

class MobileTouchHandler {
    constructor(editor) {
        this.editor = editor;
        this.touchStartTime = 0;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.longPressTimer = null;
        this.isDragging = false;
        
        this.initTouchEvents();
    }

    initTouchEvents() {
        const elements = document.querySelectorAll('.editable-element');
        
        elements.forEach(element => {
            // 移除原有的双击和点击事件
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
            this.isDragging = false;
            
            // 长按触发编辑（任何位置都可以）
            this.longPressTimer = setTimeout(() => {
                this.editor.selectElement(element);
                this.showEditIndicator(element);
                this.isDragging = false;
            }, 400); // 缩短长按时间到400ms
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
            
            if (deltaX > 5 || deltaY > 5) {
                // 滑动操作，标记为拖动
                this.isDragging = true;
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
            
            // 短按（点击） - 选中元素（任何位置都可以）
            if (touchDuration < 300 && deltaX < 10 && deltaY < 10 && !this.isDragging) {
                this.editor.selectElementWithoutPanel(element);
                this.showSelectionIndicator(element);
            }
            
            this.isDragging = false;
        }, { passive: false });

        // 触摸取消
        element.addEventListener('touchcancel', () => {
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
            this.isDragging = false;
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

// 移动端功能修复
function fixMobileFunctions() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
        console.log('检测到移动设备，启用移动端功能修复');
        
        // 1. 修复文件上传功能
        fixMobileFileUpload();
        
        // 2. 修复摄像头权限提示
        fixCameraPermissions();
        
        // 3. 修复打印功能
        fixMobilePrint();
        
        // 4. 添加移动端优化
        optimizeMobileInputs();
        MobileTouchHandler.optimizePrintForMobile();
        
        // 5. 显示移动端使用提示
        showMobileTips();
    }
}

// 修复移动端文件上传
function fixMobileFileUpload() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        // 确保文件输入在移动端可见
        input.style.display = 'block';
        input.style.width = '100%';
        input.style.height = '44px';
        input.style.opacity = '1';
    });
}

// 修复摄像头权限
function fixCameraPermissions() {
    // 移动端需要明确的用户交互才能请求摄像头权限
    const scanBtn = document.getElementById('scanText');
    if (scanBtn) {
        scanBtn.addEventListener('click', function() {
            // 显示摄像头权限提示
            if (confirm('移动端使用摄像头需要授权。请允许浏览器访问摄像头权限。')) {
                // 用户确认后尝试访问摄像头
                if (typeof navigator.mediaDevices !== 'undefined' && 
                    typeof navigator.mediaDevices.getUserMedia !== 'undefined') {
                    navigator.mediaDevices.getUserMedia({ video: true })
                        .then(() => {
                            console.log('摄像头权限已获得');
                        })
                        .catch(error => {
                            alert('摄像头访问被拒绝：' + error.message);
                        });
                }
            }
        });
    }
}

// 修复移动端打印
function fixMobilePrint() {
    const printBtn = document.getElementById('print');
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            // 移动端打印指导
            showMobilePrintGuide();
        });
    }
}

// 显示移动端打印指导
function showMobilePrintGuide() {
    const guide = document.createElement('div');
    guide.className = 'mobile-print-guide';
    guide.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; justify-content: center; align-items: center;">
            <div style="background: white; padding: 20px; border-radius: 12px; max-width: 90%; text-align: center;">
                <h3 style="color: #007bff; margin-bottom: 15px;">📱 移动端打印指导</h3>
                <p style="margin-bottom: 15px;">移动浏览器打印功能有限，请使用以下方法：</p>
                <ol style="text-align: left; margin-bottom: 15px;">
                    <li>点击浏览器菜单（右上角三个点）</li>
                    <li>选择"分享"或"发送"</li>
                    <li>选择"打印"或保存为PDF</li>
                    <li>使用打印APP进行打印</li>
                </ol>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                    我知道了
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(guide);
}

// 显示移动端使用提示
function showMobileTips() {
    // 延迟显示提示，避免干扰用户
    setTimeout(() => {
        const tips = document.createElement('div');
        tips.className = 'mobile-tips';
        tips.innerHTML = `
            <div style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #007bff; color: white; padding: 10px 15px; border-radius: 8px; z-index: 9999; font-size: 14px;">
                💡 提示：移动端请使用Chrome浏览器，并允许所有权限请求
            </div>
        `;
        document.body.appendChild(tips);
        
        // 5秒后自动隐藏
        setTimeout(() => {
            if (tips.parentNode) {
                tips.parentNode.removeChild(tips);
            }
        }, 5000);
    }, 2000);
}

// 移动端初始化
document.addEventListener('DOMContentLoaded', function() {
    fixMobileFunctions();
});