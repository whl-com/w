class PrintTemplateEditor {
    constructor() {
        this.template = document.getElementById('printTemplate');
        this.propertiesPanel = document.getElementById('propertiesPanel');
        this.selectedElement = null;
        this.elementCount = 0;
        this.mobileTouchHandler = null;
        
        // 立即初始化事件监听器，因为已经在DOMContentLoaded中调用
        this.initEventListeners();
        this.initMobileTouch();
    }

    // 初始化移动端触摸支持
    initMobileTouch() {
        // 检测是否为移动设备
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            console.log('检测到移动设备，启用触摸事件支持');
            
            // 延迟加载移动触摸处理器，确保DOM完全加载
            setTimeout(() => {
                try {
                    // 动态加载mobile-events.js
                    if (typeof MobileTouchHandler !== 'undefined') {
                        this.mobileTouchHandler = new MobileTouchHandler(this);
                        console.log('移动触摸事件处理器初始化成功');
                    } else {
                        console.warn('MobileTouchHandler未定义，请确保mobile-events.js已加载');
                        this.fallbackMobileTouchSupport();
                    }
                } catch (error) {
                    console.error('移动触摸处理器初始化失败:', error);
                    this.fallbackMobileTouchSupport();
                }
            }, 100);
        }
    }

    // 备用移动触摸支持（如果MobileTouchHandler不可用）
    fallbackMobileTouchSupport() {
        console.log('启用备用移动触摸支持');
        
        const elements = document.querySelectorAll('.editable-element');
        elements.forEach(element => {
            this.addMobileTouchEvents(element);
        });
    }

    // 添加移动触摸事件
    addMobileTouchEvents(element) {
        let touchStartTime = 0;
        let longPressTimer = null;
        let isDragging = false;

        // 触摸开始
        element.addEventListener('touchstart', (e) => {
            // 只在非输入元素上阻止默认行为
            if (!e.target.matches('input, textarea, select, [contenteditable="true"]')) {
                e.preventDefault();
            }
            touchStartTime = Date.now();
            isDragging = false;
            
            // 长按2秒触发编辑
            longPressTimer = setTimeout(() => {
                this.selectElement(element);
                this.showTouchIndicator(element, '#667eea');
                isDragging = false;
            }, 2000);
        }, { passive: false });

        // 触摸移动
        element.addEventListener('touchmove', (e) => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            isDragging = true;
        }, { passive: false });

        // 触摸结束
        element.addEventListener('touchend', (e) => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            
            const touchDuration = Date.now() - touchStartTime;
            
            // 短按选中元素
            if (touchDuration < 300 && !isDragging) {
                this.selectElementWithoutPanel(element);
                this.showTouchIndicator(element, '#4CAF50');
            }
            
            isDragging = false;
        }, { passive: false });

        // 触摸取消
        element.addEventListener('touchcancel', () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            isDragging = false;
        }, { passive: false });
    }

    // 显示触摸指示器
    showTouchIndicator(element, color) {
        element.style.boxShadow = `0 0 0 3px ${color}`;
        setTimeout(() => {
            element.style.boxShadow = '';
        }, 1000);
    }

    initEventListeners() {
        // 添加文本按钮
        document.getElementById('addText').addEventListener('click', () => {
            this.addTextElement('双击编辑文本');
        });

        // 添加图片按钮
        document.getElementById('addImage').addEventListener('click', () => {
            this.addImageElement();
        });

        // 扫描识别按钮
        document.getElementById('scanText').addEventListener('click', () => {
            this.startCameraScan();
        });

        // 打印按钮
        document.getElementById('print').addEventListener('click', () => {
            this.showPrintPreview();
        });

        // 保存模板按钮
        document.getElementById('saveTemplate').addEventListener('click', () => {
            this.saveTemplate();
        });

        // 加载模板按钮
        document.getElementById('loadTemplate').addEventListener('click', () => {
            this.showTemplateSelection();
        });

        // 保存属性按钮
        document.getElementById('saveProps').addEventListener('click', () => {
            this.saveProperties();
        });

        // 删除元素按钮
        document.getElementById('deleteElement').addEventListener('click', () => {
            this.deleteSelectedElement();
        });

        // 替换图片按钮
        document.getElementById('replaceImageBtn').addEventListener('click', () => {
            document.getElementById('replaceImageInput').click();
        });

        // 图片替换文件选择
        document.getElementById('replaceImageInput').addEventListener('change', (e) => {
            this.replaceSelectedImage(e);
        });

        // 模板点击事件（取消选择）
        this.template.addEventListener('click', (e) => {
            if (e.target === this.template) {
                this.deselectElement();
            }
        });
    }

    addTextElement(text = '双击编辑文本') {
        const id = `element-${++this.elementCount}`;
        const element = document.createElement('div');
        
        element.className = 'editable-element text-element';
        element.id = id;
        element.innerHTML = text;
        element.style.left = '50px';
        element.style.top = '50px';
        element.style.fontSize = '14px';
        element.style.textAlign = 'left';
        
        // 双击编辑（任何位置都可以触发）
        element.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.selectElement(element);
        });

        // 点击选择（只选中不弹出属性面板）
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectElementWithoutPanel(element);
        });

        this.template.appendChild(element);
        this.makeDraggable(element);
    }

    addImageElement() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.createImageElement(event.target.result);
                };
                reader.readAsDataURL(file);
            }
        };
        
        input.click();
    }

    createImageElement(src) {
        const id = `element-${++this.elementCount}`;
        const element = document.createElement('div');
        
        element.className = 'editable-element image-element';
        element.id = id;
        element.style.left = '100px';
        element.style.top = '100px';
        element.style.width = '100px';
        element.style.height = '100px';
        
        const img = document.createElement('img');
        img.src = src;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        
        element.appendChild(img);

        // 双击编辑
        element.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.selectElement(element);
        });

        // 点击选择（只选中不弹出属性面板）
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectElementWithoutPanel(element);
        });

        this.template.appendChild(element);
        this.makeDraggable(element);
        this.makeResizable(element);
    }

    startCameraScan() {
        // 创建摄像头扫描界面
        const scanOverlay = document.createElement('div');
        scanOverlay.className = 'scan-overlay';
        scanOverlay.innerHTML = `
            <div class="scan-container">
                <div class="scan-header">
                    <h3>扫描识别文字</h3>
                    <button class="close-scan">×</button>
                </div>
                <video id="scanVideo" autoplay playsinline></video>
                <div class="scan-controls">
                    <button id="captureBtn" class="tool-btn primary">拍照识别</button>
                    <button id="switchCamera" class="tool-btn">切换摄像头</button>
                </div>
                <div class="scan-guide">
                    <p>将文字对准取景框，点击拍照识别</p>
                </div>
            </div>
        `;
        
        scanOverlay.style.position = 'fixed';
        scanOverlay.style.top = '0';
        scanOverlay.style.left = '0';
        scanOverlay.style.width = '100%';
        scanOverlay.style.height = '100%';
        scanOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        scanOverlay.style.zIndex = '1000';
        scanOverlay.style.display = 'flex';
        scanOverlay.style.justifyContent = 'center';
        scanOverlay.style.alignItems = 'center';

        document.body.appendChild(scanOverlay);

        const video = document.getElementById('scanVideo');
        const captureBtn = document.getElementById('captureBtn');
        const switchCamera = document.getElementById('switchCamera');
        const closeBtn = scanOverlay.querySelector('.close-scan');

        let currentFacingMode = 'environment'; // 默认后置摄像头

        // 关闭扫描界面
        closeBtn.addEventListener('click', () => {
            this.stopCameraStream();
            document.body.removeChild(scanOverlay);
        });

        // 切换摄像头
        switchCamera.addEventListener('click', () => {
            currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
            this.stopCameraStream();
            this.startCamera(video, currentFacingMode);
        });

        // 拍照识别
        captureBtn.addEventListener('click', () => {
            this.captureAndRecognize(video, scanOverlay);
        });

        // 开始摄像头
        this.startCamera(video, currentFacingMode);
    }

    startCamera(video, facingMode) {
        const constraints = {
            video: {
                facingMode: facingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
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
                console.error('摄像头访问错误:', error);
                alert('无法访问摄像头，请确保已授予相机权限');
                document.querySelector('.scan-overlay')?.remove();
            });
    }

    stopCameraStream() {
        const video = document.getElementById('scanVideo');
        if (video && video.srcObject) {
            const tracks = video.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            video.srcObject = null;
        }
    }

    captureAndRecognize(video, scanOverlay) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        
        // 显示加载提示
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-overlay';
        loadingElement.innerHTML = '<div class="loading-text">正在识别文字，请稍候...</div>';
        loadingElement.style.position = 'fixed';
        loadingElement.style.top = '0';
        loadingElement.style.left = '0';
        loadingElement.style.width = '100%';
        loadingElement.style.height = '100%';
        loadingElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        loadingElement.style.display = 'flex';
        loadingElement.style.justifyContent = 'center';
        loadingElement.style.alignItems = 'center';
        loadingElement.style.zIndex = '1001';
        loadingElement.style.color = 'white';
        loadingElement.style.fontSize = '18px';
        
        document.body.appendChild(loadingElement);

        // 使用Tesseract.js识别中文文字
        Tesseract.recognize(
            imageDataUrl,
            'chi_sim', // 中文简体
            { 
                logger: m => console.log(m),
                tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK
            }
        ).then(({ data: { text } }) => {
            // 移除加载提示和扫描界面
            document.body.removeChild(loadingElement);
            this.stopCameraStream();
            document.body.removeChild(scanOverlay);
            
            if (text && text.trim()) {
                // 将识别出的文字添加到模板中
                this.addTextFromScan(text.trim());
            } else {
                alert('未能识别到文字，请确保图片清晰且包含中文文字');
            }
        }).catch(error => {
            document.body.removeChild(loadingElement);
            console.error('OCR识别错误:', error);
            alert('文字识别失败，请检查网络连接或稍后重试');
        });
    }

    addTextFromScan(text) {
        // 将扫描识别出的文字添加到模板中
        const id = `element-${++this.elementCount}`;
        const element = document.createElement('div');
        
        element.className = 'editable-element text-element scan-text';
        element.id = id;
        element.innerHTML = text;
        element.style.left = '50px';
        element.style.top = '50px';
        element.style.fontSize = '14px';
        element.style.textAlign = 'left';
        element.style.color = '#000';
        element.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        element.style.padding = '10px';
        element.style.borderRadius = '5px';
        element.style.maxWidth = '80%';
        element.style.wordBreak = 'break-all';
        element.style.border = '2px dashed #007bff';
        
        // 双击编辑（任何位置都可以触发）
        element.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.selectElement(element);
        });

        // 点击选择（只选中不弹出属性面板）
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectElementWithoutPanel(element);
        });

        this.template.appendChild(element);
        this.makeDraggable(element);
        this.selectElement(element);
        
        // 自动滚动到新添加的文字
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }



    makeDraggable(element) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        element.addEventListener('mousedown', (e) => {
            if (e.target === element || e.target.tagName === 'IMG') {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                startLeft = parseInt(element.style.left) || 0;
                startTop = parseInt(element.style.top) || 0;
                
                this.selectElementWithoutPanel(element);
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                
                element.style.left = Math.max(0, Math.min(startLeft + dx, this.template.offsetWidth - element.offsetWidth)) + 'px';
                element.style.top = Math.max(0, Math.min(startTop + dy, this.template.offsetHeight - element.offsetHeight)) + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // 触摸设备支持
        element.addEventListener('touchstart', (e) => {
            if (e.target === element || e.target.tagName === 'IMG') {
                isDragging = true;
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                startLeft = parseInt(element.style.left) || 0;
                startTop = parseInt(element.style.top) || 0;
                
                this.selectElementWithoutPanel(element);
                e.preventDefault();
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (isDragging) {
                const dx = e.touches[0].clientX - startX;
                const dy = e.touches[0].clientY - startY;
                
                element.style.left = Math.max(0, Math.min(startLeft + dx, this.template.offsetWidth - element.offsetWidth)) + 'px';
                element.style.top = Math.max(0, Math.min(startTop + dy, this.template.offsetHeight - element.offsetHeight)) + 'px';
                e.preventDefault();
            }
        });

        document.addEventListener('touchend', () => {
            isDragging = false;
        });
    }

    makeResizable(element) {
        if (element.classList.contains('image-element')) {
            const handle = document.createElement('div');
            handle.className = 'resize-handle se';
            element.appendChild(handle);

            let isResizing = false;
            let startX, startY, startWidth, startHeight;

            handle.addEventListener('mousedown', (e) => {
                isResizing = true;
                startX = e.clientX;
                startY = e.clientY;
                startWidth = element.offsetWidth;
                startHeight = element.offsetHeight;
                e.stopPropagation();
                e.preventDefault();
            });

            document.addEventListener('mousemove', (e) => {
                if (isResizing) {
                    const dx = e.clientX - startX;
                    const dy = e.clientY - startY;
                    
                    const newWidth = Math.max(50, startWidth + dx);
                    const newHeight = Math.max(50, startHeight + dy);
                    
                    element.style.width = newWidth + 'px';
                    element.style.height = newHeight + 'px';
                }
            });

            document.addEventListener('mouseup', () => {
                isResizing = false;
            });
        }
    }

    selectElement(element) {
        this.deselectElement();
        
        this.selectedElement = element;
        element.classList.add('selected');
        
        // 显示属性面板并填充数据
        this.showPropertiesPanel();
        this.fillProperties(element);
    }

    selectElementWithoutPanel(element) {
        this.deselectElement();
        
        this.selectedElement = element;
        element.classList.add('selected');
        
        // 只选中，不显示属性面板
    }

    deselectElement() {
        if (this.selectedElement) {
            this.selectedElement.classList.remove('selected');
            this.selectedElement = null;
        }
        this.hidePropertiesPanel();
    }

    // 显示打印预览
    showPrintPreview() {
        const modal = document.createElement('div');
        modal.className = 'print-preview-modal';
        modal.innerHTML = `
            <div class="print-preview-container">
                <div class="print-preview-header">
                    <h3>打印预览</h3>
                    <button class="close-preview">×</button>
                </div>
                <div class="print-preview-content">
                    <div class="preview-template"></div>
                </div>
                <div class="print-preview-footer">
                    <button class="btn-cancel">取消</button>
                    <button class="btn-print">打印</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 复制模板内容到预览区域 - 确保打印样式应用
        const previewTemplate = modal.querySelector('.preview-template');
        const originalTemplate = this.template.cloneNode(true);
        
        // 为预览内容强制应用打印样式
        const elements = originalTemplate.querySelectorAll('.editable-element');
        elements.forEach(element => {
            element.style.color = '#000000';
            element.style.backgroundColor = 'transparent';
            element.style.border = 'none';
            element.style.boxShadow = 'none';
            
            // 确保文本元素有足够的对比度
            if (element.classList.contains('text-element')) {
                element.style.color = '#000000';
                element.style.textShadow = 'none';
            }
            
            // 确保图片元素可见
            if (element.classList.contains('image-element')) {
                element.style.border = '1px solid #000000';
                element.style.backgroundColor = '#ffffff';
            }
        });
        
        previewTemplate.appendChild(originalTemplate);
        
        // 绑定事件
        modal.querySelector('.close-preview').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.btn-cancel').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.btn-print').addEventListener('click', () => {
            this.showPrinterSelection();
            document.body.removeChild(modal);
        });
        
        // 触摸事件处理
        modal.addEventListener('touchstart', (e) => {
            e.stopPropagation();
        });
        
        modal.addEventListener('touchmove', (e) => {
            e.stopPropagation();
        });
        
        modal.addEventListener('touchend', (e) => {
            e.stopPropagation();
        });
    }

    // 显示打印机选择
    showPrinterSelection() {
        // 显示打印机选择对话框
        if (window.print) {
            // 在打印前强制应用打印样式
            const elements = this.template.querySelectorAll('.editable-element');
            elements.forEach(element => {
                // 强制黑色文字和透明背景
                element.style.color = '#000000';
                element.style.backgroundColor = 'transparent';
                element.style.border = 'none';
                element.style.boxShadow = 'none';
                element.style.textShadow = 'none';
                element.style.opacity = '1';
                
                // 移除任何可能影响打印的样式
                element.style.filter = 'none';
                element.style.webkitFilter = 'none';
                element.style.transform = 'none';
                
                // 确保文本元素可见
                if (element.classList.contains('text-element')) {
                    element.style.color = '#000000';
                    element.style.textShadow = 'none';
                    element.style.fontWeight = 'normal';
                }
                
                // 确保图片元素可见
                if (element.classList.contains('image-element')) {
                    const img = element.querySelector('img');
                    if (img) {
                        img.style.opacity = '1';
                        img.style.filter = 'none';
                    }
                    element.style.border = '1px solid #000000';
                    element.style.backgroundColor = '#ffffff';
                }
            });
            
            // 添加短暂的延迟确保样式应用
            setTimeout(() => {
                window.print();
            }, 100);
        } else {
            alert('您的浏览器不支持打印功能，请使用Ctrl+P快捷键进行打印。');
        }
    }

    // 显示打印指导
    showPrintInstructions() {
        const instructions = document.createElement('div');
        instructions.className = 'print-instructions-modal';
        instructions.innerHTML = `
            <div class="print-instructions-container">
                <div class="print-instructions-header">
                    <h3>打印指导</h3>
                    <button class="close-instructions">×</button>
                </div>
                <div class="print-instructions-content">
                    <p>📋 <strong>打印步骤：</strong></p>
                    <ol>
                        <li>按 <kbd>Ctrl</kbd> + <kbd>P</kbd> (Windows) 或 <kbd>Cmd</kbd> + <kbd>P</kbd> (Mac)</li>
                        <li>在打印对话框中选择打印机</li>
                        <li>设置打印选项：<strong>实际尺寸</strong>、<strong>无边距</strong></li>
                        <li>点击"打印"按钮</li>
                    </ol>
                    
                    <div class="print-shortcuts">
                        <p>⚡ <strong>快捷键：</strong></p>
                        <div class="shortcut-grid">
                            <span class="shortcut"><kbd>Ctrl</kbd> + <kbd>P</kbd></span>
                            <span>打开打印对话框</span>
                        </div>
                    </div>
                    
                    <div class="browser-print-info">
                        <p>🌐 <strong>浏览器打印支持：</strong></p>
                        <ul>
                            <li>Chrome/Firefox/Edge: 完全支持</li>
                            <li>Safari: 完全支持</li>
                            <li>移动浏览器: 部分支持（可能需要分享到打印APP）</li>
                        </ul>
                    </div>
                </div>
                <div class="print-instructions-controls">
                    <button class="got-it-btn primary">我知道了</button>
                </div>
            </div>
        `;

        instructions.style.position = 'fixed';
        instructions.style.top = '0';
        instructions.style.left = '0';
        instructions.style.width = '100%';
        instructions.style.height = '100%';
        instructions.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        instructions.style.zIndex = '3000';
        instructions.style.display = 'flex';
        instructions.style.justifyContent = 'center';
        instructions.style.alignItems = 'center';

        document.body.appendChild(instructions);

        // 关闭指导
        const closeBtn = instructions.querySelector('.close-instructions');
        const gotItBtn = instructions.querySelector('.got-it-btn');
        
        const closeInstructions = () => {
            document.body.removeChild(instructions);
        };

        closeBtn.addEventListener('click', closeInstructions);
        gotItBtn.addEventListener('click', closeInstructions);

        // 移动端触摸关闭支持
        instructions.addEventListener('touchstart', (e) => {
            if (e.target === instructions) {
                closeInstructions();
            }
        });
    }

    showPropertiesPanel() {
        this.propertiesPanel.classList.add('visible');
    }

    hidePropertiesPanel() {
        this.propertiesPanel.classList.remove('visible');
    }

    fillProperties(element) {
        // 显示对应的属性面板
        if (element.classList.contains('text-element')) {
            document.getElementById('textProperties').style.display = 'block';
            document.getElementById('imageProperties').style.display = 'none';
            
            document.getElementById('contentInput').value = element.innerHTML.replace(/<br\s*\/?>/gi, '\n');
            document.getElementById('fontSizeInput').value = parseInt(element.style.fontSize) || 14;
            document.getElementById('alignInput').value = element.style.textAlign || 'left';
            document.getElementById('stylePreset').value = this.getStylePreset(element);
            document.getElementById('boldInput').checked = element.style.fontWeight === 'bold';
        } else if (element.classList.contains('image-element')) {
            document.getElementById('textProperties').style.display = 'none';
            document.getElementById('imageProperties').style.display = 'block';
            
            document.getElementById('imageWidthInput').value = parseInt(element.style.width) || 100;
            document.getElementById('imageHeightInput').value = parseInt(element.style.height) || 100;
        } else {
            document.getElementById('textProperties').style.display = 'none';
            document.getElementById('imageProperties').style.display = 'none';
        }
    }

    saveProperties() {
        if (!this.selectedElement) return;

        if (this.selectedElement.classList.contains('text-element')) {
            const content = document.getElementById('contentInput').value;
            const fontSize = document.getElementById('fontSizeInput').value + 'px';
            const align = document.getElementById('alignInput').value;
            const preset = document.getElementById('stylePreset').value;
            const isBold = document.getElementById('boldInput').checked;

            // 处理换行符，将\n转换为<br>标签
            const formattedContent = content.replace(/\n/g, '<br>');
            this.selectedElement.innerHTML = formattedContent;
            this.selectedElement.style.fontSize = fontSize;
            this.selectedElement.style.fontSize = fontSize;
            this.selectedElement.style.textAlign = align;
            this.selectedElement.style.fontWeight = isBold ? 'bold' : 'normal';
            this.applyStylePreset(this.selectedElement, preset);
        } else if (this.selectedElement.classList.contains('image-element')) {
            const width = document.getElementById('imageWidthInput').value + 'px';
            const height = document.getElementById('imageHeightInput').value + 'px';
            
            this.selectedElement.style.width = width;
            this.selectedElement.style.height = height;
        }
        
        // 保存后隐藏属性面板
        this.hidePropertiesPanel();
    }

    deleteSelectedElement() {
        if (this.selectedElement) {
            this.selectedElement.remove();
            this.selectedElement = null;
            this.hidePropertiesPanel();
        }
    }

    replaceSelectedImage(e) {
        if (!this.selectedElement || !this.selectedElement.classList.contains('image-element')) {
            return;
        }
        
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = this.selectedElement.querySelector('img');
                if (img) {
                    img.src = event.target.result;
                }
            };
            reader.readAsDataURL(file);
        }
        
        // 清空文件输入，允许选择同一个文件再次触发change事件
        e.target.value = '';
    }

    getStylePreset(element) {
        const fontSize = parseInt(element.style.fontSize) || 14;
        const fontWeight = element.style.fontWeight || 'normal';
        const fontStyle = element.style.fontStyle || 'normal';
        
        if (fontSize >= 24 && fontWeight === 'bold') return 'title';
        if (fontSize >= 18 && fontWeight === 'bold') return 'subtitle';
        if (fontSize === 14 && fontWeight === 'normal') return 'body';
        if (fontSize <= 12) return 'small';
        if (fontStyle === 'italic' || fontWeight === 'bold') return 'emphasis';
        return '';
    }

    applyStylePreset(element, preset) {
        element.style.fontWeight = 'normal';
        element.style.fontStyle = 'normal';
        element.style.textDecoration = 'none';
        element.style.color = '';
        
        switch(preset) {
            case 'title':
                element.style.fontSize = '24px';
                element.style.fontWeight = 'bold';
                break;
            case 'subtitle':
                element.style.fontSize = '18px';
                element.style.fontWeight = 'bold';
                break;
            case 'body':
                element.style.fontSize = '14px';
                break;
            case 'small':
                element.style.fontSize = '12px';
                break;
            case 'emphasis':
                element.style.fontWeight = 'bold';
                element.style.fontStyle = 'italic';
                break;
            default:
                // 保持当前样式
                break;
        }
    }

    // 模板保存和加载相关方法
    saveTemplate() {
        const templateName = prompt('请输入模板名称：');
        if (!templateName) return;
        
        const elements = this.template.querySelectorAll('.editable-element');
        const templateData = {
            name: templateName,
            elements: []
        };
        
        elements.forEach(element => {
            const elementData = {
                type: element.classList.contains('text-element') ? 'text' : 'image',
                content: element.innerHTML,
                style: {
                    left: element.style.left,
                    top: element.style.top,
                    fontSize: element.style.fontSize,
                    textAlign: element.style.textAlign,
                    fontWeight: element.style.fontWeight,
                    width: element.style.width,
                    height: element.style.height
                }
            };
            
            if (element.classList.contains('image-element')) {
                const img = element.querySelector('img');
                elementData.src = img ? img.src : '';
            }
            
            templateData.elements.push(elementData);
        });
        
        // 保存到localStorage
        const templates = JSON.parse(localStorage.getItem('printTemplates') || '[]');
        templates.push(templateData);
        localStorage.setItem('printTemplates', JSON.stringify(templates));
        
        alert(`模板"${templateName}"保存成功！`);
    }

    showTemplateSelection() {
        const templates = JSON.parse(localStorage.getItem('printTemplates') || '[]');
        if (templates.length === 0) {
            alert('没有保存的模板，请先保存一个模板。');
            return;
        }
        
        // 创建模板选择界面
        const selectionOverlay = document.createElement('div');
        selectionOverlay.className = 'template-selection-overlay';
        selectionOverlay.innerHTML = `
            <div class="template-selection-container">
                <div class="selection-header">
                    <h3>选择模板</h3>
                    <button class="close-selection">×</button>
                </div>
                <div class="template-list">
                    ${templates.map((template, index) => `
                        <div class="template-item" data-index="${index}">
                            <span class="template-name">${template.name}</span>
                            <button class="load-btn">加载</button>
                            <button class="delete-btn">删除</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        selectionOverlay.style.position = 'fixed';
        selectionOverlay.style.top = '0';
        selectionOverlay.style.left = '0';
        selectionOverlay.style.width = '100%';
        selectionOverlay.style.height = '100%';
        selectionOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        selectionOverlay.style.zIndex = '2000';
        selectionOverlay.style.display = 'flex';
        selectionOverlay.style.justifyContent = 'center';
        selectionOverlay.style.alignItems = 'center';

        document.body.appendChild(selectionOverlay);

        // 关闭选择界面
        const closeBtn = selectionOverlay.querySelector('.close-selection');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(selectionOverlay);
        });

        // 加载模板
        selectionOverlay.querySelectorAll('.load-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.template-item').dataset.index);
                this.loadTemplate(templates[index]);
                document.body.removeChild(selectionOverlay);
            });
        });

        // 删除模板
        selectionOverlay.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.template-item').dataset.index);
                if (confirm(`确定要删除模板"${templates[index].name}"吗？`)) {
                    templates.splice(index, 1);
                    localStorage.setItem('printTemplates', JSON.stringify(templates));
                    document.body.removeChild(selectionOverlay);
                    this.showTemplateSelection(); // 刷新列表
                }
            });
        });
    }

    loadTemplate(templateData) {
        // 清空当前模板
        this.template.innerHTML = '';
        this.elementCount = 0;
        
        // 加载模板元素
        templateData.elements.forEach(elementData => {
            if (elementData.type === 'text') {
                const element = document.createElement('div');
                element.className = 'editable-element text-element';
                element.id = `element-${++this.elementCount}`;
                element.innerHTML = elementData.content;
                
                // 应用样式
                Object.assign(element.style, elementData.style);
                
                // 添加事件监听
                element.addEventListener('dblclick', (e) => {
                    e.stopPropagation();
                    this.selectElement(element);
                });

                element.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectElementWithoutPanel(element);
                });

                this.template.appendChild(element);
                this.makeDraggable(element);
            } else if (elementData.type === 'image') {
                const element = document.createElement('div');
                element.className = 'editable-element image-element';
                element.id = `element-${++this.elementCount}`;
                
                // 应用样式
                Object.assign(element.style, elementData.style);
                
                const img = document.createElement('img');
                img.src = elementData.src;
                img.style.maxWidth = '100%';
                img.style.maxHeight = '100%';
                
                element.appendChild(img);

                // 添加事件监听
                element.addEventListener('dblclick', (e) => {
                    e.stopPropagation();
                    this.selectElement(element);
                });

                element.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectElementWithoutPanel(element);
                });

                this.template.appendChild(element);
                this.makeDraggable(element);
                this.makeResizable(element);
            }
        });
        
        alert(`模板"${templateData.name}"加载成功！`);
    }
}

// Word编辑器核心功能 - 简化版
class WordStyleEditor {
    constructor() {
        this.currentOrientation = 'portrait';
        this.currentZoom = 1;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadFromLocalStorage();
        this.updateStatus();
    }
    
    setupEventListeners() {
        const editor = document.getElementById('editor');
        
        if (editor) {
            editor.addEventListener('keyup', () => this.updateStatus());
            editor.addEventListener('mouseup', () => this.updateStatus());
            editor.addEventListener('click', () => this.updateStatus());
            
            // 自动保存
            editor.addEventListener('input', this.debounce(() => this.saveToLocalStorage(), 1000));
        }
        
        // 工具栏按钮事件
        this.setupToolbarEvents();
    }
    
    // 设置工具栏事件
    setupToolbarEvents() {
        // 字体选择
        const fontSelect = document.getElementById('fontFamily');
        if (fontSelect) {
            fontSelect.addEventListener('change', (e) => {
                this.formatText('fontName', e.target.value);
            });
        }
        
        // 字号设置
        const fontSizeSelect = document.getElementById('fontSize');
        if (fontSizeSelect) {
            fontSizeSelect.addEventListener('change', (e) => {
                this.formatText('fontSize', e.target.value);
            });
        }
        
        // 加粗按钮
        const boldBtn = document.getElementById('boldBtn');
        if (boldBtn) {
            boldBtn.addEventListener('click', () => {
                this.formatText('bold');
                boldBtn.classList.toggle('active');
            });
        }
        
        // 左对齐
        const alignLeftBtn = document.getElementById('alignLeft');
        if (alignLeftBtn) {
            alignLeftBtn.addEventListener('click', () => {
                this.formatText('justifyLeft');
                this.updateAlignmentButtons('left');
            });
        }
        
        // 居中对齐
        const alignCenterBtn = document.getElementById('alignCenter');
        if (alignCenterBtn) {
            alignCenterBtn.addEventListener('click', () => {
                this.formatText('justifyCenter');
                this.updateAlignmentButtons('center');
            });
        }
        
        // 右对齐
        const alignRightBtn = document.getElementById('alignRight');
        if (alignRightBtn) {
            alignRightBtn.addEventListener('click', () => {
                this.formatText('justifyRight');
                this.updateAlignmentButtons('right');
            });
        }
        
        // 页面方向切换
        const portraitBtn = document.getElementById('portraitBtn');
        const landscapeBtn = document.getElementById('landscapeBtn');
        if (portraitBtn && landscapeBtn) {
            portraitBtn.addEventListener('click', () => this.setPageOrientation('portrait'));
            landscapeBtn.addEventListener('click', () => this.setPageOrientation('landscape'));
        }
        
        // 缩放控制
        const zoomSelect = document.getElementById('zoomLevel');
        if (zoomSelect) {
            zoomSelect.addEventListener('change', (e) => {
                this.setZoom(e.target.value);
            });
        }
        
        // 打印按钮
        const printBtn = document.getElementById('print');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                this.printDocument();
            });
        }
        
        // 关闭打印预览
        const closePreviewBtn = document.getElementById('closePreview');
        if (closePreviewBtn) {
            closePreviewBtn.addEventListener('click', () => {
                this.closePrintPreview();
            });
        }
        
        // 确认打印
        const confirmPrintBtn = document.getElementById('confirmPrint');
        if (confirmPrintBtn) {
            confirmPrintBtn.addEventListener('click', () => {
                window.print();
                this.closePrintPreview();
            });
        }
    }
    
    // 更新对齐按钮状态
    updateAlignmentButtons(alignment) {
        const buttons = ['alignLeft', 'alignCenter', 'alignRight'];
        buttons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.classList.remove('active');
            }
        });
        
        const activeBtn = document.getElementById(`align${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
    
    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 文本格式化
    formatText(command, value = null) {
        const editor = document.getElementById('editor');
        if (editor) {
            document.execCommand(command, false, value);
            editor.focus();
            this.updateStatus();
            this.saveToLocalStorage();
        }
    }
    
    // 设置页面方向
    setPageOrientation(orientation) {
        const page = document.getElementById('page');
        const buttons = document.querySelectorAll('.page-size-btn');
        
        if (buttons.length > 0) {
            buttons.forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.getElementById(orientation + 'Btn');
            if (activeBtn) {
                activeBtn.classList.add('active');
            }
        }
        
        this.currentOrientation = orientation;
        
        if (page) {
            if (orientation === 'landscape') {
                page.classList.add('landscape');
            } else {
                page.classList.remove('landscape');
            }
        }
        
        this.saveToLocalStorage();
    }
    
    // 设置缩放
    setZoom(zoom) {
        this.currentZoom = parseFloat(zoom);
        const editor = document.getElementById('editor');
        if (editor) {
            editor.style.transform = `scale(${this.currentZoom})`;
            editor.style.transformOrigin = 'top left';
        }
        this.saveToLocalStorage();
    }
    
    // 更新状态栏
    updateStatus() {
        // 状态栏更新功能已简化，不需要具体实现
    }
    
    // 保存到本地存储
    saveToLocalStorage() {
        const editor = document.getElementById('editor');
        if (editor) {
            const content = editor.innerHTML;
            localStorage.setItem('editorContent', content);
            localStorage.setItem('editorOrientation', this.currentOrientation);
            localStorage.setItem('editorZoom', this.currentZoom);
        }
    }
    
    // 从本地存储加载
    loadFromLocalStorage() {
        const content = localStorage.getItem('editorContent');
        const orientation = localStorage.getItem('editorOrientation');
        const zoom = localStorage.getItem('editorZoom');
        
        const editor = document.getElementById('editor');
        if (editor && content) {
            editor.innerHTML = content;
        }
        
        if (orientation) {
            this.setPageOrientation(orientation);
        }
        
        if (zoom) {
            const zoomSelect = document.getElementById('zoomLevel');
            if (zoomSelect) {
                zoomSelect.value = zoom;
            }
            this.setZoom(zoom);
        }
    }
    
    // 显示打印预览
    showPrintPreview() {
        const editor = document.getElementById('editor');
        const previewContent = document.getElementById('previewContent');
        const printPreview = document.getElementById('printPreview');
        
        if (editor && previewContent && printPreview) {
            previewContent.innerHTML = editor.innerHTML;
            printPreview.style.display = 'flex';
        }
    }
    
    // 关闭打印预览
    closePrintPreview() {
        const printPreview = document.getElementById('printPreview');
        if (printPreview) {
            printPreview.style.display = 'none';
        }
    }
    
    // 打印文档
    printDocument() {
        this.showPrintPreview();
    }
}

// 初始化Word编辑器
let wordEditor;
document.addEventListener('DOMContentLoaded', () => {
    // 初始化主编辑器
    new PrintTemplateEditor();
    
    // 初始化Word风格编辑器（如果存在相关元素）
    if (document.getElementById('editor')) {
        wordEditor = new WordStyleEditor();
    }
});