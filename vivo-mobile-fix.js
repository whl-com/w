// vivo手机专用兼容性修复
class VivoMobileFix {
    constructor(editor) {
        this.editor = editor;
        this.isVivoMobile = this.detectVivoMobile();
        
        if (this.isVivoMobile) {
            console.log('检测到vivo手机，应用专用修复');
            this.applyVivoFixes();
        }
    }
    
    // 检测vivo手机
    detectVivoMobile() {
        const userAgent = navigator.userAgent;
        return (/vivo/i.test(userAgent) || /V\d{4}/i.test(userAgent)) && 
               /Android/i.test(userAgent);
    }
    
    // 应用vivo手机修复
    applyVivoFixes() {
        this.fixVivoButtonClicks();
        this.fixVivoFileInput();
        this.fixVivoCamera();
        this.fixVivoTouchEvents();
        this.addVivoSpecificStyles();
        this.addVivoFallbackMechanisms();
    }
    
    // 修复vivo按钮点击
    fixVivoButtonClicks() {
        const buttons = ['addText', 'addImage', 'scanText', 'print'];
        
        buttons.forEach(btnId => {
            const button = document.getElementById(btnId);
            if (button) {
                // 移除所有现有事件监听器
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                // 添加vivo专用事件处理
                this.addVivoButtonEvents(newButton, btnId);
            }
        });
    }
    
    // 添加vivo按钮事件
    addVivoButtonEvents(button, btnId) {
        // 触摸开始
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            button.style.transform = 'scale(0.95)';
            button.style.opacity = '0.8';
        }, { passive: false });
        
        // 触摸结束
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            button.style.transform = '';
            button.style.opacity = '';
            
            // 执行对应功能
            setTimeout(() => {
                this.executeVivoButtonFunction(btnId);
            }, 50);
        }, { passive: false });
        
        // 触摸取消
        button.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            button.style.transform = '';
            button.style.opacity = '';
        }, { passive: false });
    }
    
    // 执行vivo按钮功能
    executeVivoButtonFunction(btnId) {
        switch(btnId) {
            case 'addText':
                this.editor.addTextElement('vivo文本');
                break;
            case 'addImage':
                this.triggerVivoImageInput();
                break;
            case 'scanText':
                this.editor.startCameraScan();
                break;
            case 'print':
                window.print();
                break;
        }
    }
    
    // 触发vivo图片输入
    triggerVivoImageInput() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.position = 'fixed';
        input.style.left = '-1000px';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.editor.createImageElement(event.target.result);
                };
                reader.readAsDataURL(file);
            }
            document.body.removeChild(input);
        };
        
        // 特殊处理vivo文件选择
        setTimeout(() => {
            document.body.appendChild(input);
            
            // 尝试多种触发方式
            const event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            
            try {
                input.dispatchEvent(event);
            } catch (error) {
                console.log('vivo文件选择触发方式1失败');
                
                // 备用方案
                try {
                    input.click();
                } catch (error2) {
                    console.log('vivo文件选择触发方式2失败');
                    alert('请手动选择图片文件');
                }
            }
        }, 100);
    }
    
    // 修复vivo摄像头
    fixVivoCamera() {
        // 重写摄像头启动方法
        const originalStartCamera = this.editor.startCamera;
        if (originalStartCamera) {
            this.editor.startCamera = function(video, facingMode) {
                // vivo手机摄像头配置
                const constraints = {
                    video: {
                        facingMode: facingMode,
                        width: { min: 320, ideal: 640, max: 1280 },
                        height: { min: 240, ideal: 480, max: 720 }
                    }
                };

                navigator.mediaDevices.getUserMedia(constraints)
                    .then((stream) => {
                        video.srcObject = stream;
                        video.onloadedmetadata = () => {
                            video.play().catch(e => {
                                console.log('vivo视频播放失败，尝试直接播放');
                                video.play();
                            });
                        };
                    })
                    .catch((error) => {
                        console.error('vivo摄像头访问错误:', error);
                        
                        // vivo专用错误提示
                        if (error.name === 'NotAllowedError') {
                            alert('请允许相机权限：\\n1. 点击地址栏的相机图标\\n2. 选择"允许"\\n3. 刷新页面后重试');
                        } else if (error.name === 'NotFoundError') {
                            alert('未找到摄像头，请检查vivo手机摄像头是否正常');
                        } else {
                            alert('摄像头访问失败，请尝试使用其他浏览器');
                        }
                        
                        document.querySelector('.scan-overlay')?.remove();
                    });
            };
        }
    }
    
    // 修复vivo触摸事件
    fixVivoTouchEvents() {
        // 防止vivo浏览器的默认触摸行为
        document.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('tool-btn')) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, { passive: false, capture: true });
        
        // 添加全局触摸监听
        document.addEventListener('touchend', (e) => {
            if (e.target.classList.contains('tool-btn')) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, { passive: false, capture: true });
    }
    
    // 添加vivo专用样式
    addVivoSpecificStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* vivo手机专用样式 */
            .tool-btn {
                min-height: 48px !important;
                min-width: 48px !important;
                padding: 14px 20px !important;
                font-size: 17px !important;
                font-weight: bold !important;
                border: 2px solid #e0e0e0 !important;
                background: linear-gradient(135deg, #667eea, #764ba2) !important;
                color: white !important;
                border-radius: 12px !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                margin: 8px !important;
            }
            
            /* vivo按钮激活状态 */
            .tool-btn:active {
                transform: scale(0.92) !important;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2) !important;
            }
            
            /* vivo扫描界面优化 */
            .scan-overlay {
                background: rgba(0, 0, 0, 0.95) !important;
            }
            
            .scan-container {
                background: linear-gradient(135deg, #2c3e50, #34495e) !important;
                border-radius: 20px !important;
                padding: 20px !important;
            }
            
            /* vivo文件选择优化 */
            input[type="file"] {
                font-size: 18px !important;
                padding: 12px !important;
            }
            
            /* vivo文字识别优化 */
            .scan-text {
                font-size: 16px !important;
                line-height: 1.6 !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 添加vivo备用机制
    addVivoFallbackMechanisms() {
        // 创建备用按钮容器
        const fallbackContainer = document.createElement('div');
        fallbackContainer.className = 'vivo-fallback';
        fallbackContainer.style.position = 'fixed';
        fallbackContainer.style.bottom = '20px';
        fallbackContainer.style.right = '20px';
        fallbackContainer.style.zIndex = '9999';
        fallbackContainer.innerHTML = `
            <button onclick="window.vivoFallbackAddText()" style="margin:5px;padding:8px 12px;background:#4CAF50;color:white;border:none;border-radius:6px;">添加文本</button>
            <button onclick="window.vivoFallbackAddImage()" style="margin:5px;padding:8px 12px;background:#2196F3;color:white;border:none;border-radius:6px;">添加图片</button>
        `;
        
        document.body.appendChild(fallbackContainer);
        
        // 全局备用函数
        window.vivoFallbackAddText = () => {
            if (typeof PrintTemplateEditor !== 'undefined') {
                const editor = new PrintTemplateEditor();
                editor.addTextElement('备用文本');
            }
        };
        
        window.vivoFallbackAddImage = () => {
            this.triggerVivoImageInput();
        };
    }
}

// 初始化vivo手机修复
document.addEventListener('DOMContentLoaded', function() {
    // 等待页面完全加载
    setTimeout(() => {
        if (typeof PrintTemplateEditor !== 'undefined') {
            const editor = new PrintTemplateEditor();
            new VivoMobileFix(editor);
            
            // 额外延迟初始化，确保vivo浏览器完全加载
            setTimeout(() => {
                console.log('vivo手机修复初始化完成');
            }, 2000);
        }
    }, 1500);
});