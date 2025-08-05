// 全局变量
let currentImage = null;
let apiSettings = {
    provider: 'demo',
    apiKey: ''
};

// DOM元素
const elements = {
    uploadArea: document.getElementById('uploadArea'),
    uploadBtn: document.getElementById('uploadBtn'),
    fileInput: document.getElementById('fileInput'),
    previewSection: document.getElementById('previewSection'),
    previewImage: document.getElementById('previewImage'),
    changeImageBtn: document.getElementById('changeImageBtn'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    loadingSection: document.getElementById('loadingSection'),
    resultsSection: document.getElementById('resultsSection'),
    newAnalysisBtn: document.getElementById('newAnalysisBtn'),
    settingsToggle: document.getElementById('settingsToggle'),
    settingsPanel: document.getElementById('settingsPanel'),
    apiProvider: document.getElementById('apiProvider'),
    apiKey: document.getElementById('apiKey'),
    saveSettings: document.getElementById('saveSettings')
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadSettings();
});

// 事件监听器
function initializeEventListeners() {
    // 文件上传相关
    elements.uploadBtn.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileSelect);
    elements.changeImageBtn.addEventListener('click', () => elements.fileInput.click());
    
    // 拖拽上传
    elements.uploadArea.addEventListener('dragover', handleDragOver);
    elements.uploadArea.addEventListener('dragleave', handleDragLeave);
    elements.uploadArea.addEventListener('drop', handleDrop);
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    
    // 分析按钮
    elements.analyzeBtn.addEventListener('click', analyzeImage);
    elements.newAnalysisBtn.addEventListener('click', resetToUpload);
    
    // 设置相关
    elements.settingsToggle.addEventListener('click', toggleSettings);
    elements.saveSettings.addEventListener('click', saveSettings);
}

// 拖拽处理
function handleDragOver(e) {
    e.preventDefault();
    elements.uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    elements.uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    elements.uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// 文件选择处理
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

// 文件处理
function handleFile(file) {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
        showNotification('请选择有效的图片文件', 'error');
        return;
    }
    
    // 验证文件大小 (最大10MB)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('图片文件过大，请选择小于10MB的文件', 'error');
        return;
    }
    
    currentImage = file;
    
    // 显示预览
    const reader = new FileReader();
    reader.onload = function(e) {
        elements.previewImage.src = e.target.result;
        showSection('preview');
    };
    reader.readAsDataURL(file);
}

// 显示指定区域
function showSection(section) {
    // 隐藏所有区域
    elements.previewSection.style.display = 'none';
    elements.loadingSection.style.display = 'none';
    elements.resultsSection.style.display = 'none';
    
    switch(section) {
        case 'preview':
            elements.previewSection.style.display = 'block';
            break;
        case 'loading':
            elements.loadingSection.style.display = 'block';
            break;
        case 'results':
            elements.resultsSection.style.display = 'block';
            break;
        case 'upload':
        default:
            // 上传区域默认显示
            break;
    }
}

// 图片分析
async function analyzeImage() {
    if (!currentImage) {
        showNotification('请先选择图片', 'error');
        return;
    }
    
    showSection('loading');
    
    try {
        let result;
        
        switch(apiSettings.provider) {
            case 'openai':
                result = await analyzeWithOpenAI(currentImage);
                break;
            case 'google':
                result = await analyzeWithGoogle(currentImage);
                break;
            case 'azure':
                result = await analyzeWithAzure(currentImage);
                break;
            case 'demo':
            default:
                result = await getDemoResult(currentImage);
                break;
        }
        
        displayResults(result);
        showSection('results');
        
    } catch (error) {
        console.error('分析失败:', error);
        showNotification('图片分析失败: ' + error.message, 'error');
        showSection('preview');
    }
}

// OpenAI Vision API分析
async function analyzeWithOpenAI(image) {
    if (!apiSettings.apiKey) {
        throw new Error('请先设置OpenAI API密钥');
    }
    
    const base64 = await fileToBase64(image);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiSettings.apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "请详细分析这张图片，包括：1.主要内容描述 2.检测到的对象 3.场景信息 4.如果有文字请识别出来。请用JSON格式返回结果。"
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: base64
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1000
        })
    });
    
    if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    return parseOpenAIResponse(data.choices[0].message.content);
}

// Google Vision API分析
async function analyzeWithGoogle(image) {
    if (!apiSettings.apiKey) {
        throw new Error('请先设置Google Vision API密钥');
    }
    
    const base64 = await fileToBase64(image, false);
    
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiSettings.apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            requests: [
                {
                    image: {
                        content: base64
                    },
                    features: [
                        { type: 'LABEL_DETECTION', maxResults: 10 },
                        { type: 'TEXT_DETECTION', maxResults: 10 },
                        { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
                        { type: 'IMAGE_PROPERTIES' }
                    ]
                }
            ]
        })
    });
    
    if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    return parseGoogleResponse(data.responses[0]);
}

// Azure Vision API分析
async function analyzeWithAzure(image) {
    if (!apiSettings.apiKey) {
        throw new Error('请先设置Azure Vision API密钥');
    }
    
    // 这里需要替换为实际的Azure Vision API端点
    const endpoint = 'YOUR_AZURE_ENDPOINT';
    
    const formData = new FormData();
    formData.append('file', image);
    
    const response = await fetch(`${endpoint}/vision/v3.2/analyze?visualFeatures=Categories,Description,Objects,Tags,Adult,Color,Faces,ImageType,Tags&details=Landmarks`, {
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': apiSettings.apiKey
        },
        body: formData
    });
    
    if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    return parseAzureResponse(data);
}

// 演示模式 - 生成模拟数据
async function getDemoResult(image) {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const fileName = image.name.toLowerCase();
    let mockResult;
    
    // 根据文件名生成不同的模拟结果
    if (fileName.includes('cat') || fileName.includes('猫')) {
        mockResult = {
            description: "这是一张可爱的猫咪照片。图片中显示了一只毛茸茸的小猫，看起来非常温顺可爱。猫咪的眼神清澈明亮，毛色看起来很健康。",
            objects: [
                { name: "猫", confidence: 0.95 },
                { name: "动物", confidence: 0.92 },
                { name: "宠物", confidence: 0.88 },
                { name: "毛发", confidence: 0.85 }
            ],
            text: null,
            scene: [
                { label: "室内", confidence: 0.78 },
                { label: "家庭环境", confidence: 0.65 },
                { label: "宠物照片", confidence: 0.90 }
            ],
            confidence: 0.93,
            colors: ["棕色", "白色", "黑色"],
            mood: "温馨可爱"
        };
    } else if (fileName.includes('dog') || fileName.includes('狗')) {
        mockResult = {
            description: "图片展示了一只友善的狗狗。这只狗看起来很活泼，姿态自然，可能正在户外活动。它的表情显得很开心和放松。",
            objects: [
                { name: "狗", confidence: 0.96 },
                { name: "动物", confidence: 0.94 },
                { name: "宠物", confidence: 0.90 },
                { name: "哺乳动物", confidence: 0.87 }
            ],
            text: null,
            scene: [
                { label: "户外", confidence: 0.82 },
                { label: "公园", confidence: 0.70 },
                { label: "休闲", confidence: 0.75 }
            ],
            confidence: 0.94,
            colors: ["金色", "棕色", "白色"],
            mood: "活泼开朗"
        };
    } else if (fileName.includes('car') || fileName.includes('汽车')) {
        mockResult = {
            description: "这是一张汽车的照片。车辆看起来保养良好，线条流畅。可能是在道路上或停车场拍摄的。",
            objects: [
                { name: "汽车", confidence: 0.97 },
                { name: "车辆", confidence: 0.95 },
                { name: "交通工具", confidence: 0.90 },
                { name: "轮胎", confidence: 0.85 }
            ],
            text: null,
            scene: [
                { label: "道路", confidence: 0.80 },
                { label: "交通", confidence: 0.85 },
                { label: "城市", confidence: 0.72 }
            ],
            confidence: 0.92,
            colors: ["黑色", "银色", "灰色"],
            mood: "现代都市"
        };
    } else {
        // 通用结果
        mockResult = {
            description: "这是一张清晰的图片，包含了多个有趣的元素。图片的构图很好，光线充足，色彩丰富。整体给人的感觉很好。",
            objects: [
                { name: "物体", confidence: 0.85 },
                { name: "图像", confidence: 0.92 },
                { name: "照片", confidence: 0.88 },
                { name: "内容", confidence: 0.80 }
            ],
            text: null,
            scene: [
                { label: "日常", confidence: 0.75 },
                { label: "生活", confidence: 0.70 },
                { label: "记录", confidence: 0.80 }
            ],
            confidence: 0.85,
            colors: ["多彩", "自然"],
            mood: "日常生活"
        };
    }
    
    return mockResult;
}

// 解析响应数据
function parseOpenAIResponse(content) {
    try {
        return JSON.parse(content);
    } catch {
        // 如果不是JSON格式，手动解析
        return {
            description: content,
            objects: [{ name: "检测内容", confidence: 0.8 }],
            text: null,
            scene: [{ label: "通用场景", confidence: 0.7 }],
            confidence: 0.8
        };
    }
}

function parseGoogleResponse(response) {
    return {
        description: response.labelAnnotations ? 
            response.labelAnnotations.slice(0, 3).map(label => label.description).join(', ') : 
            "Google Vision API 分析结果",
        objects: response.labelAnnotations ? 
            response.labelAnnotations.map(label => ({
                name: label.description,
                confidence: label.score
            })) : [],
        text: response.textAnnotations ? response.textAnnotations[0]?.description : null,
        scene: response.labelAnnotations ? 
            response.labelAnnotations.slice(0, 5).map(label => ({
                label: label.description,
                confidence: label.score
            })) : [],
        confidence: response.labelAnnotations ? 
            response.labelAnnotations[0]?.score || 0.8 : 0.8
    };
}

function parseAzureResponse(response) {
    return {
        description: response.description?.captions[0]?.text || "Azure Vision API 分析结果",
        objects: response.objects ? 
            response.objects.map(obj => ({
                name: obj.object,
                confidence: obj.confidence
            })) : [],
        text: response.readResult ? response.readResult.content : null,
        scene: response.categories ? 
            response.categories.map(cat => ({
                label: cat.name,
                confidence: cat.score
            })) : [],
        confidence: response.description?.captions[0]?.confidence || 0.8
    };
}

// 显示结果
function displayResults(result) {
    // 主要描述
    document.getElementById('mainDescription').textContent = result.description;
    
    // 检测到的对象
    const objectsList = document.getElementById('objectsList');
    objectsList.innerHTML = '';
    
    if (result.objects && result.objects.length > 0) {
        result.objects.forEach(obj => {
            const tag = document.createElement('div');
            tag.className = 'object-tag';
            tag.innerHTML = `
                <span>${obj.name}</span>
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${(obj.confidence * 100).toFixed(0)}%"></div>
                </div>
                <small>${(obj.confidence * 100).toFixed(0)}%</small>
            `;
            objectsList.appendChild(tag);
        });
    } else {
        objectsList.innerHTML = '<p>未检测到特定对象</p>';
    }
    
    // 文字识别
    const textDetection = document.getElementById('textDetection');
    const detectedText = document.getElementById('detectedText');
    
    if (result.text) {
        textDetection.style.display = 'block';
        detectedText.textContent = result.text;
    } else {
        textDetection.style.display = 'none';
    }
    
    // 场景信息
    const sceneInfo = document.getElementById('sceneInfo');
    sceneInfo.innerHTML = '';
    
    if (result.scene && result.scene.length > 0) {
        result.scene.forEach(scene => {
            const item = document.createElement('div');
            item.className = 'scene-item';
            item.innerHTML = `
                <span class="scene-label">${scene.label}</span>
                <span class="scene-confidence">${(scene.confidence * 100).toFixed(0)}%</span>
            `;
            sceneInfo.appendChild(item);
        });
    } else {
        sceneInfo.innerHTML = '<p>场景信息不可用</p>';
    }
    
    // 置信度详情
    const confidenceDetails = document.getElementById('confidenceDetails');
    confidenceDetails.innerHTML = `
        <div class="confidence-item">
            <span class="confidence-label">整体置信度</span>
            <span class="confidence-value">${(result.confidence * 100).toFixed(1)}%</span>
        </div>
        <div class="confidence-item">
            <span class="confidence-label">检测对象数量</span>
            <span class="confidence-value">${result.objects ? result.objects.length : 0}</span>
        </div>
        <div class="confidence-item">
            <span class="confidence-label">分析时间</span>
            <span class="confidence-value">${new Date().toLocaleTimeString()}</span>
        </div>
        ${result.colors ? `
        <div class="confidence-item">
            <span class="confidence-label">主要颜色</span>
            <span class="confidence-value">${result.colors.join(', ')}</span>
        </div>
        ` : ''}
        ${result.mood ? `
        <div class="confidence-item">
            <span class="confidence-label">图片氛围</span>
            <span class="confidence-value">${result.mood}</span>
        </div>
        ` : ''}
    `;
}

// 重置到上传状态
function resetToUpload() {
    currentImage = null;
    elements.fileInput.value = '';
    elements.previewImage.src = '';
    showSection('upload');
}

// 设置相关功能
function toggleSettings() {
    const panel = elements.settingsPanel;
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function saveSettings() {
    apiSettings.provider = elements.apiProvider.value;
    apiSettings.apiKey = elements.apiKey.value;
    
    // 保存到本地存储
    localStorage.setItem('imageAnalyzer_settings', JSON.stringify(apiSettings));
    
    showNotification('设置已保存', 'success');
    elements.settingsPanel.style.display = 'none';
}

function loadSettings() {
    const saved = localStorage.getItem('imageAnalyzer_settings');
    if (saved) {
        apiSettings = { ...apiSettings, ...JSON.parse(saved) };
        elements.apiProvider.value = apiSettings.provider;
        elements.apiKey.value = apiSettings.apiKey;
    }
}

// 工具函数
async function fileToBase64(file, includeDataUrl = true) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            let result = reader.result;
            if (!includeDataUrl) {
                result = result.split(',')[1]; // 移除data:image/...;base64,前缀
            }
            resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // 添加样式
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        minWidth: '300px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        transform: 'translateX(400px)',
        transition: 'transform 0.3s ease'
    });
    
    // 设置背景色
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8'
    };
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 自动移除
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}