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
            }, 2000); // 长按2秒触发编辑
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
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isChrome = /Chrome\//i.test(navigator.userAgent);
    
    if (isMobile) {
        console.log('检测到移动设备，启用移动端优化');
        
        // 修复文件上传
        fixMobileFileUpload();
        
        // 修复摄像头权限
        fixCameraPermissions();
        
        // 修复打印功能
        fixMobilePrint();
        
        // 修复输入框缩放问题
        optimizeMobileInputs();
        MobileTouchHandler.optimizePrintForMobile();
        
        // 显示使用提示
        showMobileTips();
        
        // 如果是手机Chrome浏览器，执行特定修复
        if (isChrome && isMobile) {
            console.log('检测到手机Chrome浏览器，启用Chrome特定修复');
            fixChromeMobileSpecific();
        }
    }
}

// 手机Chrome特定修复
function fixChromeMobileSpecific() {
    // 修复文件上传
    fixChromeFileUpload();
    
    // 修复摄像头权限
    fixChromeCameraPermissions();
    
    // 修复点击事件
    fixChromeClickEvents();
    
    // 修复打印功能
    fixChromePrint();
    
    // 显示Chrome特定提示
    showChromeMobileTips();
}

// 手机Chrome特定修复
function fixChromeMobileSpecific() {
    // 修复手机Chrome的文件上传问题
    fixChromeFileUpload();
    
    // 修复手机Chrome的摄像头权限问题
    fixChromeCameraPermissions();
    
    // 修复手机Chrome的点击事件问题
    fixChromeClickEvents();
    
    // 修复手机Chrome的打印功能
    fixChromePrint();
    
    // 添加手机Chrome使用提示
    showChromeMobileTips();
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

// 修复手机Chrome文件上传
function fixChromeFileUpload() {
    // 手机Chrome需要明确的用户交互才能触发文件选择
    const addImageBtn = document.getElementById('addImage');
    if (addImageBtn) {
        // 移除原有的事件监听器
        const newAddImageBtn = addImageBtn.cloneNode(true);
        addImageBtn.parentNode.replaceChild(newAddImageBtn, addImageBtn);
        
        // 添加新的点击事件
        newAddImageBtn.addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                z-index: 10000;
            `;
            
            input.onchange = function(e) {
                if (e.target.files.length > 0) {
                    // 触发图片添加功能
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        // 调用主编辑器的方法
                        if (window.editor && typeof window.editor.createImageElement === 'function') {
                            window.editor.createImageElement(event.target.result);
                        }
                    };
                    reader.readAsDataURL(file);
                }
                document.body.removeChild(input);
            };
            
            document.body.appendChild(input);
            input.click();
        });
    }
}

// 修复手机Chrome摄像头权限
function fixChromeCameraPermissions() {
    const scanBtn = document.getElementById('scanText');
    if (scanBtn) {
        // 移除原有的事件监听器
        const newScanBtn = scanBtn.cloneNode(true);
        scanBtn.parentNode.replaceChild(newScanBtn, scanBtn);
        
        newScanBtn.addEventListener('click', function() {
            // 显示明确的权限请求提示
            if (confirm('手机Chrome需要使用摄像头进行文字识别。请允许摄像头权限，然后点击确定继续。')) {
                // 延迟执行以确保用户看到提示
                setTimeout(() => {
                    if (window.editor && typeof window.editor.startCameraScan === 'function') {
                        window.editor.startCameraScan();
                    }
                }, 500);
            }
        });
    }
}

// 修复手机Chrome点击事件
function fixChromeClickEvents() {
    // 手机Chrome需要防止默认行为来避免页面缩放
    const elements = document.querySelectorAll('.editable-element');
    elements.forEach(element => {
        element.addEventListener('touchstart', function(e) {
            // 只在非双击情况下阻止默认行为
            if (!e.touches || e.touches.length !== 2) {
                e.preventDefault();
            }
        }, { passive: false });
        
        element.addEventListener('touchend', function(e) {
            // 只在非双击情况下阻止默认行为
            if (!e.changedTouches || e.changedTouches.length !== 2) {
                e.preventDefault();
            }
        }, { passive: false });
    });
}

// 修复手机Chrome打印功能
function fixChromePrint() {
    const printBtn = document.getElementById('print');
    if (printBtn) {
        // 移除原有的事件监听器
        const newPrintBtn = printBtn.cloneNode(true);
        printBtn.parentNode.replaceChild(newPrintBtn, printBtn);
        
        newPrintBtn.addEventListener('click', function() {
            // 手机Chrome打印需要通过分享菜单
            showChromePrintGuide();
        });
    }
}

// 显示手机Chrome打印指导
function showChromePrintGuide() {
    const guide = document.createElement('div');
    guide.className = 'chrome-print-guide';
    guide.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; justify-content: center; align-items: center;">
            <div style="background: white; padding: 25px; border-radius: 15px; max-width: 90%; text-align: center;">
                <h3 style="color: #007bff; margin-bottom: 20px;">📱 手机Chrome打印指南</h3>
                <p style="margin-bottom: 15px; color: #333;">手机Chrome浏览器打印操作：</p>
                <ol style="text-align: left; margin-bottom: 20px; color: #555;">
                    <li>点击浏览器右上角的三个点</li>
                    <li>选择"分享"选项</li>
                    <li>选择"打印"或"生成PDF"</li>
                    <li>选择打印机或保存为PDF</li>
                </ol>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: #007bff; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px;">
                    我知道了
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(guide);
}

// 显示手机Chrome使用提示
function showChromeMobileTips() {
    setTimeout(() => {
        const tips = document.createElement('div');
        tips.className = 'chrome-mobile-tips';
        tips.innerHTML = `
            <div style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #28a745; color: white; padding: 12px 18px; border-radius: 10px; z-index: 9999; font-size: 14px; max-width: 90%; text-align: center;">
                📱 手机Chrome提示：请允许所有权限请求以获得完整功能
            </div>
        `;
        document.body.appendChild(tips);
        
        setTimeout(() => {
            if (tips.parentNode) {
                tips.parentNode.removeChild(tips);
            }
        }, 7000);
    }, 3000);
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