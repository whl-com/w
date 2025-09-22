// vivo手机终极兼容性修复
class VivoUltimateFix {
    constructor() {
        this.isVivo = this.detectVivo();
        this.isVivoBrowser = this.detectVivoBrowser();
        this.isVivoChrome = this.detectVivoChrome();
        
        if (this.isVivo) {
            console.log('检测到vivo手机，应用终极修复方案');
            this.applyUltimateFixes();
        }
    }
    
    // 检测vivo设备
    detectVivo() {
        const ua = navigator.userAgent;
        return /vivo/i.test(ua) || /V\d{4}/i.test(ua);
    }
    
    // 检测vivo自带浏览器
    detectVivoBrowser() {
        return navigator.userAgent.includes('VivoBrowser');
    }
    
    // 检测vivo上的Chrome
    detectVivoChrome() {
        return navigator.userAgent.includes('Chrome') && this.isVivo;
    }
    
    // 应用终极修复
    applyUltimateFixes() {
        this.replaceAllButtons();
        this.addGlobalListeners();
        this.injectVivoStyles();
        this.createEmergencyButtons();
        this.fixPrintFunctionality();
        this.fixCameraAccess();
        this.fixFileInputs();
        
        // 延迟执行确保页面完全加载
        setTimeout(() => {
            this.forceButtonActivation();
        }, 2000);
    }
    
    // 替换所有按钮
    replaceAllButtons() {
        const buttonIds = ['addText', 'addImage', 'scanText', 'print'];
        
        buttonIds.forEach(id => {
            const originalBtn = document.getElementById(id);
            if (originalBtn) {
                // 创建全新按钮
                const newBtn = document.createElement('button');
                newBtn.id = id + '_vivo';
                newBtn.className = originalBtn.className;
                newBtn.innerHTML = originalBtn.innerHTML;
                newBtn.style.cssText = originalBtn.style.cssText;
                
                // 复制所有属性
                for (let i = 0; i < originalBtn.attributes.length; i++) {
                    const attr = originalBtn.attributes[i];
                    if (attr.name !== 'id') {
                        newBtn.setAttribute(attr.name, attr.value);
                    }
                }
                
                // 替换原按钮
                originalBtn.parentNode.replaceChild(newBtn, originalBtn);
                
                // 绑定新事件
                this.bindVivoButtonEvents(newBtn, id);
            }
        });
    }
    
    // 绑定vivo按钮事件
    bindVivoButtonEvents(button, action) {
        // 完全清除所有现有事件
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // 触摸开始
        newButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            newButton.style.transform = 'scale(0.92)';
            newButton.style.opacity = '0.8';
        }, true);
        
        // 触摸结束
        newButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            newButton.style.transform = '';
            newButton.style.opacity = '';
            
            setTimeout(() => {
                this.executeVivoAction(action);
            }, 50);
        }, true);
        
        // 点击事件
        newButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            this.executeVivoAction(action);
        }, true);
        
        // 鼠标事件
        newButton.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, true);
        
        newButton.addEventListener('mouseup', (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, true);
    }
    
    // 执行vivo动作
    executeVivoAction(action) {
        console.log('vivo执行动作:', action);
        
        switch(action) {
            case 'addText':
                this.vivoAddText();
                break;
            case 'addImage':
                this.vivoAddImage();
                break;
            case 'scanText':
                this.vivoScanText();
                break;
            case 'print':
                this.vivoPrint();
                break;
        }
    }
    
    // vivo添加文本
    vivoAddText() {
        if (typeof PrintTemplateEditor !== 'undefined') {
            const editor = new PrintTemplateEditor();
            editor.addTextElement('vivo文本');
        } else {
            this.fallbackAddText();
        }
    }
    
    // vivo添加图片
    vivoAddImage() {
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
                    if (typeof PrintTemplateEditor !== 'undefined') {
                        const editor = new PrintTemplateEditor();
                        editor.createImageElement(event.target.result);
                    }
                };
                reader.readAsDataURL(file);
            }
            document.body.removeChild(input);
        };
        
        document.body.appendChild(input);
        
        // 强制触发点击
        setTimeout(() => {
            try {
                input.click();
            } catch (error) {
                console.log('vivo文件选择失败:', error);
            }
        }, 100);
    }
    
    // vivo扫描文本
    vivoScanText() {
        if (typeof PrintTemplateEditor !== 'undefined') {
            const editor = new PrintTemplateEditor();
            editor.startCameraScan();
        } else {
            alert('请允许摄像头权限');
        }
    }
    
    // vivo打印
    vivoPrint() {
        if (this.isVivoBrowser) {
            this.showVivoPrintGuide();
        } else {
            try {
                window.print();
            } catch (error) {
                this.showPrintError();
            }
        }
    }
    
    // 添加全局监听器
    addGlobalListeners() {
        // 全局点击监听
        document.addEventListener('click', (e) => {
            if (e.target.matches('.tool-btn, .tool-btn *')) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
        
        // 全局触摸监听
        document.addEventListener('touchstart', (e) => {
            if (e.target.matches('.tool-btn, .tool-btn *')) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
        
        document.addEventListener('touchend', (e) => {
            if (e.target.matches('.tool-btn, .tool-btn *')) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
    }
    
    // 注入vivo样式
    injectVivoStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* vivo终极样式修复 */
            .tool-btn {
                min-height: 50px !important;
                min-width: 50px !important;
                padding: 15px 25px !important;
                font-size: 18px !important;
                font-weight: bold !important;
                background: linear-gradient(135deg, #667eea, #764ba2) !important;
                color: white !important;
                border: 2px solid #ffffff30 !important;
                border-radius: 12px !important;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
                margin: 10px !important;
                touch-action: manipulation !important;
                -webkit-tap-highlight-color: transparent !important;
                user-select: none !important;
            }
            
            .tool-btn:active {
                transform: scale(0.9) !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
            }
            
            /* 防止vivo浏览器样式覆盖 */
            .tool-btn::-webkit-outer-spin-button,
            .tool-btn::-webkit-inner-spin-button {
                -webkit-appearance: none !important;
                margin: 0 !important;
            }
            
            /* vivo紧急按钮 */
            .vivo-emergency {
                position: fixed !important;
                bottom: 20px !important;
                right: 20px !important;
                z-index: 99999 !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 12px !important;
                background: rgba(255,255,255,0.95) !important;
                padding: 15px !important;
                border-radius: 15px !important;
                box-shadow: 0 8px 25px rgba(0,0,0,0.3) !important;
                border: 2px solid #667eea !important;
            }
            
            .vivo-emergency-btn {
                padding: 12px 20px !important;
                font-size: 16px !important;
                font-weight: bold !important;
                border: none !important;
                border-radius: 10px !important;
                color: white !important;
                min-width: 120px !important;
                box-shadow: 0 3px 10px rgba(0,0,0,0.2) !important;
            }
            
            .vivo-text-btn { background: #4CAF50 !important; }
            .vivo-image-btn { background: #2196F3 !important; }
            .vivo-scan-btn { background: #FF9800 !important; }
        `;
        document.head.appendChild(style);
    }
    
    // 创建紧急按钮
    createEmergencyButtons() {
        const container = document.createElement('div');
        container.className = 'vivo-emergency';
        container.innerHTML = `
            <button class="vivo-emergency-btn vivo-text-btn" onclick="window.vivoEmergencyAddText()">
                📝 添加文本
            </button>
            <button class="vivo-emergency-btn vivo-image-btn" onclick="window.vivoEmergencyAddImage()">
                🖼️ 添加图片
            </button>
            <button class="vivo-emergency-btn vivo-scan-btn" onclick="window.vivoEmergencyScan()">
                📷 扫描识别
            </button>
        `;
        
        document.body.appendChild(container);
        
        // 全局紧急函数
        window.vivoEmergencyAddText = () => this.vivoAddText();
        window.vivoEmergencyAddImage = () => this.vivoAddImage();
        window.vivoEmergencyScan = () => this.vivoScanText();
    }
    
    // 修复打印功能
    fixPrintFunctionality() {
        const printBtn = document.getElementById('print_vivo') || document.getElementById('print');
        if (printBtn) {
            printBtn.onclick = () => {
                if (this.isVivoBrowser) {
                    this.showVivoPrintGuide();
                } else {
                    window.print();
                }
            };
        }
    }
    
    // 显示vivo打印指引
    showVivoPrintGuide() {
        const guide = document.createElement('div');
        guide.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95); color: white; padding: 25px; border-radius: 20px;
            z-index: 100000; text-align: center; max-width: 320px; font-family: Arial, sans-serif;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 2px solid #ffcc00;
        `;
        guide.innerHTML = `
            <h3 style="margin:0 0 20px 0;color:#ffcc00;font-size:20px;">vivo浏览器打印指引</h3>
            <div style="text-align:left;font-size:15px;line-height:1.6;margin-bottom:20px;">
                <p>1. 点击右上角<b>"•••"</b>菜单</p>
                <p>2. 选择<b>"分享"</b>选项</p>
                <p>3. 找到<b>"打印"</b>或<b>"保存为PDF"</b></p>
                <p>4. 选择打印机或保存位置</p>
            </div>
            <button onclick="this.parentElement.remove()" style="
                padding:12px 25px; background:#4CAF50; color:white; border:none;
                border-radius:8px; font-size:16px; font-weight:bold; cursor:pointer;
            ">
                我知道了
            </button>
        `;
        document.body.appendChild(guide);
    }
    
    // 修复摄像头访问
    fixCameraAccess() {
        // 重写摄像头启动逻辑
        if (typeof PrintTemplateEditor !== 'undefined') {
            const originalStartCamera = PrintTemplateEditor.prototype.startCamera;
            if (originalStartCamera) {
                PrintTemplateEditor.prototype.startCamera = function(video, facingMode) {
                    const constraints = {
                        video: {
                            facingMode: facingMode || 'environment',
                            width: { min: 320, ideal: 640, max: 1280 },
                            height: { min: 240, ideal: 480, max: 720 }
                        }
                    };

                    return navigator.mediaDevices.getUserMedia(constraints)
                        .then((stream) => {
                            video.srcObject = stream;
                            return video.play();
                        })
                        .catch((error) => {
                            console.error('vivo摄像头错误:', error);
                            this.showCameraError(error);
                            throw error;
                        });
                };
            }
        }
    }
    
    // 显示摄像头错误
    showCameraError(error) {
        alert(`摄像头访问失败: ${error.message || '请检查权限设置'}`);
    }
    
    // 修复文件输入
    fixFileInputs() {
        // 确保文件输入可用
        const inputs = document.querySelectorAll('input[type="file"]');
        inputs.forEach(input => {
            input.style.cssText = 'position:fixed;left:-1000px;opacity:0.01;';
        });
    }
    
    // 强制按钮激活
    forceButtonActivation() {
        const buttons = document.querySelectorAll('.tool-btn');
        buttons.forEach(btn => {
            btn.style.pointerEvents = 'auto';
            btn.style.cursor = 'pointer';
        });
    }
    
    // 备用添加文本
    fallbackAddText() {
        const template = document.getElementById('printTemplate');
        if (template) {
            const textElement = document.createElement('div');
            textElement.className = 'text-element editable';
            textElement.style.cssText = 'position:absolute;left:50px;top:50px;min-width:100px;min-height:30px;padding:8px;border:2px dashed #667eea;background:rgba(102,126,234,0.1);cursor:move;user-select:none;';
            textElement.innerHTML = 'vivo文本';
            textElement.contentEditable = true;
            
            template.appendChild(textElement);
        }
    }
    
    // 显示打印错误
    showPrintError() {
        alert('打印功能暂不可用，请尝试使用其他浏览器');
    }
}

// 立即执行vivo修复
document.addEventListener('DOMContentLoaded', function() {
    // 延迟确保所有资源加载完成
    setTimeout(() => {
        new VivoUltimateFix();
        console.log('vivo终极修复已加载');
    }, 1000);
});

// 全局导出
window.VivoUltimateFix = VivoUltimateFix;