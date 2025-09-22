// 移动端Chrome浏览器兼容性修复
class ChromeMobileFix {
    constructor(editor) {
        this.editor = editor;
        this.isMobileChrome = this.detectMobileChrome();
        
        if (this.isMobileChrome) {
            this.applyChromeFixes();
        }
    }
    
    // 检测移动端Chrome浏览器
    detectMobileChrome() {
        const userAgent = navigator.userAgent;
        return /Chrome\/[.0-9]* Mobile/i.test(userAgent) && 
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    }
    
    // 应用Chrome移动端修复
    applyChromeFixes() {
        console.log('应用Chrome移动端兼容性修复');
        
        this.fixButtonClicks();
        this.fixFileInputs();
        this.fixCameraAccess();
        this.fixTouchEvents();
        this.addMobileStyles();
    }
    
    // 修复按钮点击事件
    fixButtonClicks() {
        // 添加文本按钮
        const addTextBtn = document.getElementById('addText');
        if (addTextBtn) {
            addTextBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.editor.addTextElement('新文本');
            }, { passive: false });
        }
        
        // 添加图片按钮
        const addImageBtn = document.getElementById('addImage');
        if (addImageBtn) {
            addImageBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.editor.addImageElement();
            }, { passive: false });
        }
        
        // 扫描识别按钮
        const scanBtn = document.getElementById('scanText');
        if (scanBtn) {
            scanBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.editor.startCameraScan();
            }, { passive: false });
        }
        
        // 打印按钮
        const printBtn = document.getElementById('print');
        if (printBtn) {
            printBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                window.print();
            }, { passive: false });
        }
    }
    
    // 修复文件输入
    fixFileInputs() {
        // 监听所有文件输入变化
        document.addEventListener('change', (e) => {
            if (e.target.type === 'file') {
                // 确保文件选择后能正常处理
                setTimeout(() => {
                    if (e.target.files && e.target.files.length > 0) {
                        const event = new Event('change', { bubbles: true });
                        e.target.dispatchEvent(event);
                    }
                }, 100);
            }
        });
    }
    
    // 修复摄像头访问
    fixCameraAccess() {
        // 重写摄像头启动方法
        const originalStartCamera = this.editor.startCamera;
        if (originalStartCamera) {
            this.editor.startCamera = function(video, facingMode) {
                const constraints = {
                    video: {
                        facingMode: facingMode,
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    }
                };

                navigator.mediaDevices.getUserMedia(constraints)
                    .then((stream) => {
                        video.srcObject = stream;
                        video.onloadedmetadata = () => {
                            video.play();
                        };
                    })
                    .catch((error) => {
                        console.error('Chrome移动端摄像头访问错误:', error);
                        // 提供备用方案
                        alert('摄像头访问被阻止。请确保：\\n1. 已授予相机权限\\n2. 使用HTTPS连接（GitHub Pages自动提供）\\n3. 尝试刷新页面后重试');
                        document.querySelector('.scan-overlay')?.remove();
                    });
            };
        }
    }
    
    // 修复触摸事件
    fixTouchEvents() {
        // 防止默认行为
        document.addEventListener('touchstart', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // 添加点击延迟处理
        document.addEventListener('touchend', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                e.preventDefault();
                // 模拟点击事件
                setTimeout(() => {
                    e.target.click();
                }, 50);
            }
        }, { passive: false });
    }
    
    // 添加移动端样式
    addMobileStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Chrome移动端按钮优化 */
            .tool-btn {
                min-height: 44px !important;
                min-width: 44px !important;
                padding: 12px 16px !important;
                font-size: 16px !important;
                touch-action: manipulation !important;
                -webkit-tap-highlight-color: transparent !important;
            }
            
            /* 按钮激活状态 */
            .tool-btn:active {
                transform: scale(0.95) !important;
                opacity: 0.8 !important;
            }
            
            /* 文件输入优化 */
            input[type="file"] {
                font-size: 16px !important; /* 防止iOS缩放 */
            }
            
            /* 防止文本缩放 */
            body {
                -webkit-text-size-adjust: 100% !important;
            }
            
            /* 扫描界面优化 */
            .scan-overlay {
                z-index: 10000 !important;
            }
            
            .scan-container {
                width: 90% !important;
                max-width: 400px !important;
            }
            
            #scanVideo {
                width: 100% !important;
                height: auto !important;
                border-radius: 12px !important;
            }
            
            /* 摄像头按钮优化 */
            #captureBtn, #switchCamera {
                margin: 8px !important;
                background: linear-gradient(135deg, #4CAF50, #45a049) !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// 初始化Chrome移动端修复
document.addEventListener('DOMContentLoaded', function() {
    // 等待编辑器初始化
    setTimeout(() => {
        if (typeof PrintTemplateEditor !== 'undefined') {
            const editor = new PrintTemplateEditor();
            new ChromeMobileFix(editor);
        }
    }, 1000);
});