class PrintTemplateEditor {
    constructor() {
        this.template = document.getElementById('printTemplate');
        this.propertiesPanel = document.getElementById('propertiesPanel');
        this.selectedElement = null;
        this.elementCount = 0;
        
        this.initEventListeners();
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
        
        // 双击编辑（弹出属性面板）
        element.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.selectElement(element);
        });

        // 双击编辑（弹出属性面板）
        element.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.selectElement(element);
        });

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
        // 创建打印预览模态框
        const printPreview = document.createElement('div');
        printPreview.className = 'print-preview-modal';
        printPreview.innerHTML = `
            <div class="print-preview-container">
                <div class="print-preview-header">
                    <h3>打印预览</h3>
                    <button class="close-preview">×</button>
                </div>
                <div class="print-preview-content">
                    <div class="template-print-preview">
                        ${this.template.innerHTML}
                    </div>
                </div>
                <div class="print-preview-controls">
                    <button class="print-btn primary">立即打印</button>
                    <button class="cancel-btn">取消</button>
                </div>
                <div class="print-tips">
                    <p>💡 打印提示：确保打印机设置为"实际尺寸"，边距设置为"无"</p>
                </div>
            </div>
        `;
        
        printPreview.style.position = 'fixed';
        printPreview.style.top = '0';
        printPreview.style.left = '0';
        printPreview.style.width = '100%';
        printPreview.style.height = '100%';
        printPreview.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        printPreview.style.zIndex = '2000';
        printPreview.style.display = 'flex';
        printPreview.style.justifyContent = 'center';
        printPreview.style.alignItems = 'center';

        document.body.appendChild(printPreview);

        // 关闭预览
        const closeBtn = printPreview.querySelector('.close-preview');
        const cancelBtn = printPreview.querySelector('.cancel-btn');
        
        const closePreview = () => {
            document.body.removeChild(printPreview);
        };

        closeBtn.addEventListener('click', closePreview);
        cancelBtn.addEventListener('click', closePreview);

        // 打印按钮
        const printBtn = printPreview.querySelector('.print-btn');// 打印按钮
        printBtn.addEventListener('click', () => {
            this.showPrinterSelection();
            closePreview();
        });

        // 移动端触摸关闭支持
        printPreview.addEventListener('touchstart', (e) => {
            if (e.target === printPreview) {
                closePreview();
            }
        });
    }

    // 显示打印机选择
    showPrinterSelection() {
        // 检查浏览器是否支持打印对话框
        if (typeof window.print === 'function') {
            // 使用setTimeout确保在用户交互后调用，避免浏览器阻止
            setTimeout(() => {
                try {
                    // 直接调用打印对话框（会显示打印机选择）
                    window.print();
                } catch (error) {
                    console.error('打印出错:', error);
                    // 如果直接打印失败，显示指导信息
                    this.showPrintInstructions();
                }
            }, 100);
        } else {
            // 如果不支持，提供手动指导
            this.showPrintInstructions();
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

            // 处理换行符，将\n转换为<br>标签
            const formattedContent = content.replace(/\n/g, '<br>');
            this.selectedElement.innerHTML = formattedContent;
            this.selectedElement.style.fontSize = fontSize;
            this.selectedElement.style.fontSize = fontSize;
            this.selectedElement.style.textAlign = align;
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
}

// 初始化编辑器
document.addEventListener('DOMContentLoaded', () => {
    new PrintTemplateEditor();
});

// 移动端触摸事件支持
document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchmove', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });