// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 应用状态
let appState = {
    currentMember: null,
    currentMonth: null,
    members: [],
    months: []
};

// 初始化应用
function initializeApp() {
    // 初始化月份
    initializeMonths();
    
    // 初始化团队成员
    initializeMembers();
    
    // 渲染团队成员网格
    renderTeamGrid();
    
    // 初始化月份选择器
    initializeMonthSelector();
    
    // 初始化事件监听器
    initializeEventListeners();
    
    // 加载保存的数据
    loadSavedData();
    
    // 初始化编辑器
    initializeEditor();
}

// 初始化月份数据
function initializeMonths() {
    const currentYear = 2025;
    appState.months = [];
    
    for (let i = 0; i < 12; i++) {
        const month = (i + 1) % 12 || 12;
        const year = currentYear + Math.floor(i / 12);
        const monthName = new Date(year, month - 1, 1).toLocaleString('zh-CN', { month: 'long' });
        
        appState.months.push({
            id: `${year}-${String(month).padStart(2, '0')}`,
            name: `${year}年${monthName}`,
            year: year,
            month: month
        });
    }
}

// 初始化团队成员
function initializeMembers() {
    // 8个团队成员
    const memberNames = ['张三', '李四', '王五', '赵六', '刘七', '陈八', '杨九', '吴十'];
    const researchAreas = [
        '机器学习算法',
        '自然语言处理',
        '计算机视觉',
        '数据挖掘',
        '人工智能理论',
        '智能系统',
        '知识图谱',
        '人机交互'
    ];
    
    appState.members = memberNames.map((name, index) => {
        return {
            id: `MEM${String(index + 1).padStart(3, '0')}`,
            name: name,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2c3e50&color=fff`,
            researchArea: researchAreas[index % researchAreas.length],
            progress: {
                completed: Math.floor(Math.random() * 10),
                total: 12,
                lastUpdate: null
            },
            monthlyData: {},
            files: [],
            status: ['active', 'active', 'active', 'active', 'warning', 'active', 'danger', 'active'][index]
        };
    });
}

// 渲染团队网格
function renderTeamGrid() {
    const teamGrid = document.getElementById('teamGrid');
    if (!teamGrid) return;
    
    teamGrid.innerHTML = '';
    
    appState.members.forEach(member => {
        const currentMonth = appState.months[0]?.id || '2025-01';
        const memberData = member.monthlyData[currentMonth] || {};
        
        const card = document.createElement('div');
        card.className = 'member-card';
        card.dataset.memberId = member.id;
        
        // 状态指示器
        let statusBadge = '';
        let statusClass = '';
        
        if (member.status === 'warning') {
            statusBadge = '<span class="status-badge warning"><i class="fas fa-exclamation-triangle"></i> 需关注</span>';
            statusClass = 'warning';
        } else if (member.status === 'danger') {
            statusBadge = '<span class="status-badge danger"><i class="fas fa-exclamation-circle"></i> 滞后</span>';
            statusClass = 'danger';
        }
        
        const progressPercent = member.progress.total > 0 
            ? Math.min(100, Math.round((member.progress.completed / member.progress.total) * 100))
            : 0;
        
        card.innerHTML = `
            <div class="member-header">
                <img src="${member.avatar}" alt="${member.name}" class="member-avatar">
                <div class="member-info">
                    <h3>${member.name} ${statusBadge}</h3>
                    <span class="member-id">${member.id}</span>
                </div>
            </div>
            <div class="member-research">
                <span class="research-tag">${member.researchArea}</span>
            </div>
            <div class="member-stats">
                <div class="stat-item">
                    <div class="stat-value">${member.progress.completed}</div>
                    <div class="stat-label">完成任务</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${Object.keys(member.monthlyData).length}</div>
                    <div class="stat-label">提交月数</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${member.files.length}</div>
                    <div class="stat-label">文件数</div>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            <div class="current-month">
                <div class="month-label">
                    <span>${appState.months[0]?.name || '当前月份'}</span>
                    <span class="progress-percent">${progressPercent}%</span>
                </div>
                <div class="progress-text">
                    ${memberData.content || '暂无进展记录'}
                </div>
            </div>
            <div class="member-actions">
                <button class="btn btn-outline btn-sm view-details" data-member-id="${member.id}">
                    <i class="fas fa-eye"></i> 查看详情
                </button>
                <button class="btn btn-primary btn-sm edit-progress" data-member-id="${member.id}">
                    <i class="fas fa-edit"></i> 编辑进展
                </button>
            </div>
        `;
        
        teamGrid.appendChild(card);
    });
    
    // 添加事件监听器
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', function() {
            const memberId = this.dataset.memberId;
            showMemberDetails(memberId);
        });
    });
    
    document.querySelectorAll('.edit-progress').forEach(button => {
        button.addEventListener('click', function() {
            const memberId = this.dataset.memberId;
            editMemberProgress(memberId);
        });
    });
}

// 初始化月份选择器
function initializeMonthSelector() {
    const monthButtons = document.getElementById('monthButtons');
    const memberSelect = document.getElementById('memberSelect');
    
    if (!monthButtons || !memberSelect) return;
    
    // 填充月份按钮
    appState.months.forEach(month => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'month-btn';
        button.textContent = month.name.split('年')[1];
        button.dataset.month = month.id;
        button.title = month.name;
        
        if (month.id === appState.months[0].id) {
            button.classList.add('active');
            appState.currentMonth = month.id;
        }
        
        button.addEventListener('click', function() {
            document.querySelectorAll('.month-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            appState.currentMonth = this.dataset.month;
            loadMonthData();
        });
        
        monthButtons.appendChild(button);
    });
    
    // 填充成员选择
    appState.members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = `${member.name} (${member.id}) - ${member.researchArea}`;
        memberSelect.appendChild(option);
    });
    
    memberSelect.addEventListener('change', function() {
        appState.currentMember = this.value;
        loadMonthData();
    });
}

// 初始化事件监听器
function initializeEventListeners() {
    // 导出所有进展
    const exportBtn = document.getElementById('exportAll');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportAllProgress);
    }
    
    // 保存进展
    const saveBtn = document.getElementById('saveProgress');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveCurrentProgress);
    }
    
    // 提交进展
    const submitBtn = document.getElementById('submitProgress');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitProgress);
    }
    
    // 清空编辑器
    const clearBtn = document.getElementById('clearEditor');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearEditor);
    }
    
    // 文件上传
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const browseLink = document.getElementById('browseFiles');
    
    if (uploadArea && fileInput && browseLink) {
        uploadArea.addEventListener('click', () => fileInput.click());
        browseLink.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileUpload);
        
        // 拖放上传
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.backgroundColor = '';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.backgroundColor = '';
            handleFileUpload(e);
        });
    }
    
    // 模态框关闭
    const modalClose = document.querySelector('.modal-close');
    const modal = document.getElementById('memberModal');
    
    if (modalClose && modal) {
        modalClose.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

// 初始化编辑器
function initializeEditor() {
    const editor = document.getElementById('progressEditor');
    if (!editor) return;
    
    // 设置编辑器工具栏功能
    const toolButtons = document.querySelectorAll('.tool-btn');
    toolButtons.forEach(button => {
        button.addEventListener('click', function() {
            const command = this.dataset.command;
            document.execCommand(command, false, null);
            editor.focus();
        });
    });
}

// 加载月份数据
function loadMonthData() {
    if (!appState.currentMember || !appState.currentMonth) {
        return;
    }
    
    const member = appState.members.find(m => m.id === appState.currentMember);
    if (!member) return;
    
    const editor = document.getElementById('progressEditor');
    if (editor) {
        const monthData = member.monthlyData[appState.currentMonth] || {};
        editor.innerHTML = monthData.content || '';
    }
    
    // 更新文件列表
    updateFileList();
}

// 保存当前进展
function saveCurrentProgress() {
    if (!appState.currentMember || !appState.currentMonth) {
        alert('请先选择成员和月份！');
        return;
    }
    
    const editor = document.getElementById('progressEditor');
    if (!editor) return;
    
    const content = editor.innerHTML.trim();
    if (!content) {
        alert('请输入进展内容！');
        return;
    }
    
    const member = appState.members.find(m => m.id === appState.currentMember);
    if (!member) return;
    
    // 保存数据
    if (!member.monthlyData[appState.currentMonth]) {
        member.monthlyData[appState.currentMonth] = {};
    }
    
    member.monthlyData[appState.currentMonth] = {
        content: content,
        lastModified: new Date().toISOString(),
        files: member.monthlyData[appState.currentMonth]?.files || []
    };
    
    // 更新进度
    member.progress.completed = Object.keys(member.monthlyData).length;
    member.progress.lastUpdate = new Date().toISOString();
    
    // 保存到本地存储
    saveToLocalStorage();
    
    // 更新显示
    renderTeamGrid();
    updateTimeline();
    
    showNotification('进展已保存成功！', 'success');
}

// 提交进展
function submitProgress() {
    if (!appState.currentMember || !appState.currentMonth) {
        alert('请先选择成员和月份！');
        return;
    }
    
    const member = appState.members.find(m => m.id === appState.currentMember);
    if (!member) return;
    
    const monthData = member.monthlyData[appState.currentMonth];
    if (!monthData || !monthData.content) {
        alert('请先保存进展内容！');
        return;
    }
    
    // 标记为已提交
    monthData.submitted = true;
    monthData.submittedAt = new Date().toISOString();
    
    // 更新状态
    member.status = 'active';
    
    // 保存到本地存储
    saveToLocalStorage();
    
    // 更新显示
    renderTeamGrid();
    
    showNotification('进展已成功提交给导师！', 'success');
}

// 处理文件上传
function handleFileUpload(event) {
    const files = event.type === 'change' 
        ? event.target.files 
        : event.dataTransfer.files;
    
    if (!files || files.length === 0) return;
    
    const member = appState.currentMember 
        ? appState.members.find(m => m.id === appState.currentMember)
        : null;
    
    if (!member) {
        alert('请先选择成员！');
        return;
    }
    
    Array.from(files).forEach(file => {
        if (file.size > 50 * 1024 * 1024) { // 50MB限制
            alert(`文件 ${file.name} 超过50MB限制！`);
            return;
        }
        
        const fileData = {
            id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: formatFileSize(file.size),
            type: getFileType(file.name),
            uploadDate: new Date().toISOString(),
            month: appState.currentMonth,
            file: file
        };
        
        // 添加到成员文件列表
        member.files.push(fileData);
        
        // 添加到月份数据
        if (!member.monthlyData[appState.currentMonth]) {
            member.monthlyData[appState.currentMonth] = {};
        }
        
        if (!member.monthlyData[appState.currentMonth].files) {
            member.monthlyData[appState.currentMonth].files = [];
        }
        
        member.monthlyData[appState.currentMonth].files.push(fileData);
    });
    
    // 更新文件列表显示
    updateFileList();
    
    // 保存到本地存储
    saveToLocalStorage();
    
    showNotification(`成功上传 ${files.length} 个文件！`, 'success');
    
    // 清空文件输入
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.value = '';
    }
}

// 更新文件列表显示
function updateFileList() {
    const uploadedFiles = document.getElementById('uploadedFiles');
    if (!uploadedFiles) return;
    
    uploadedFiles.innerHTML = '';
    
    if (!appState.currentMember || !appState.currentMonth) {
        uploadedFiles.innerHTML = '<p class="no-files">请先选择成员和月份</p>';
        return;
    }
    
    const member = appState.members.find(m => m.id === appState.currentMember);
    if (!member) return;
    
    const monthData = member.monthlyData[appState.currentMonth];
    if (!monthData || !monthData.files || monthData.files.length === 0) {
        uploadedFiles.innerHTML = '<p class="no-files">本月暂无上传文件</p>';
        return;
    }
    
    monthData.files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-info">
                <i class="fas fa-file-${file.type} file-icon"></i>
                <div>
                    <div class="file-name">${file.name}</div>
                    <div class="file-meta">${file.size} • ${new Date(file.uploadDate).toLocaleDateString()}</div>
                </div>
            </div>
            <div class="file-actions">
                <button class="btn-icon download-file" data-file-id="${file.id}" title="下载">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn-icon delete-file" data-file-id="${file.id}" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        uploadedFiles.appendChild(fileItem);
    });
    
    // 添加事件监听器
    document.querySelectorAll('.download-file').forEach(button => {
        button.addEventListener('click', function() {
            const fileId = this.dataset.fileId;
            downloadFile(fileId);
        });
    });
    
    document.querySelectorAll('.delete-file').forEach(button => {
        button.addEventListener('click', function() {
            const fileId = this.dataset.fileId;
            deleteFile(fileId);
        });
    });
}

// 显示成员详情
function showMemberDetails(memberId) {
    const member = appState.members.find(m => m.id === memberId);
    if (!member) return;
    
    const modal = document.getElementById('memberModal');
    const modalMemberName = document.getElementById('modalMemberName');
    const statCompleted = document.getElementById('statCompleted');
    const statSubmitted = document.getElementById('statSubmitted');
    const statLastActive = document.getElementById('statLastActive');
    const progressDetails = document.getElementById('modalProgressDetails');
    
    if (!modal || !modalMemberName) return;
    
    // 更新基本信息
    modalMemberName.textContent = `${member.name} (${member.id}) - ${member.researchArea}`;
    
    // 更新统计数据
    if (statCompleted) {
        statCompleted.textContent = Object.keys(member.monthlyData).length;
    }
    
    if (statSubmitted) {
        const submittedMonths = Object.values(member.monthlyData).filter(data => data.submitted).length;
        statSubmitted.textContent = submittedMonths;
    }
    
    if (statLastActive) {
        if (member.progress.lastUpdate) {
            const lastActive = new Date(member.progress.lastUpdate);
            statLastActive.textContent = lastActive.toLocaleDateString();
        } else {
            statLastActive.textContent = '从未';
        }
    }
    
    // 更新详细进展
    if (progressDetails) {
        progressDetails.innerHTML = '';
        
        if (Object.keys(member.monthlyData).length === 0) {
            progressDetails.innerHTML = '<p class="no-data">暂无进展记录</p>';
        } else {
            // 按月份倒序排列
            const sortedMonths = Object.keys(member.monthlyData)
                .sort()
                .reverse();
            
            sortedMonths.forEach(monthKey => {
                const monthData = member.monthlyData[monthKey];
                const month = appState.months.find(m => m.id === monthKey);
                
                if (monthData && month) {
                    const monthElement = document.createElement('div');
                    monthElement.className = 'month-detail';
                    monthElement.innerHTML = `
                        <div class="month-detail-header">
                            <h4>${month.name}</h4>
                            <span class="detail-date">${new Date(monthData.lastModified).toLocaleDateString()}</span>
                        </div>
                        <div class="month-content">${monthData.content}</div>
                        ${monthData.files && monthData.files.length > 0 ? `
                            <div class="month-files">
                                <strong>相关文件:</strong>
                                <ul>
                                    ${monthData.files.map(file => `<li>${file.name} (${file.size})</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        <div class="month-status">
                            ${monthData.submitted ? 
                                '<span class="status submitted"><i class="fas fa-check-circle"></i> 已提交</span>' : 
                                '<span class="status draft"><i class="fas fa-edit"></i> 草稿</span>'
                            }
                        </div>
                    `;
                    
                    progressDetails.appendChild(monthElement);
                }
            });
        }
    }
    
    modal.style.display = 'flex';
}

// 编辑成员进展
function editMemberProgress(memberId) {
    appState.currentMember = memberId;
    
    const memberSelect = document.getElementById('memberSelect');
    if (memberSelect) {
        memberSelect.value = memberId;
    }
    
    loadMonthData();
    
    // 滚动到编辑器
    const editorSection = document.querySelector('.progress-editor-section');
    if (editorSection) {
        editorSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    const editor = document.getElementById('progressEditor');
    if (editor) {
        editor.focus();
    }
}

// 导出所有进展
function exportAllProgress() {
    const exportData = {
        exportDate: new Date().toISOString(),
        totalMembers: appState.members.length,
        members: appState.members.map(member => ({
            id: member.id,
            name: member.name,
            researchArea: member.researchArea,
            progress: member.progress,
            monthlyData: member.monthlyData,
            files: member.files.map(f => ({ 
                name: f.name, 
                size: f.size, 
                uploadDate: f.uploadDate 
            }))
        }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `科研进展报告_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('数据导出成功！', 'success');
}

// 保存到本地存储
function saveToLocalStorage() {
    try {
        localStorage.setItem('researchProgressData', JSON.stringify(appState.members));
        localStorage.setItem('researchProgressLastSave', new Date().toISOString());
    } catch (error) {
        console.error('保存到本地存储失败:', error);
    }
}

// 从本地存储加载数据
function loadSavedData() {
    try {
        const savedData = localStorage.getItem('researchProgressData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
                // 合并保存的数据
                parsedData.forEach(savedMember => {
                    const existingMember = appState.members.find(m => m.id === savedMember.id);
                    if (existingMember) {
                        // 保留新数据的基本信息，合并进度和月度数据
                        existingMember.progress = savedMember.progress || existingMember.progress;
                        existingMember.monthlyData = savedMember.monthlyData || existingMember.monthlyData;
                        existingMember.files = savedMember.files || existingMember.files;
                        existingMember.status = savedMember.status || existingMember.status;
                    }
                });
                
                renderTeamGrid();
                showNotification('已加载保存的数据', 'info');
            }
        }
    } catch (error) {
        console.error('从本地存储加载数据失败:', error);
    }
}

// 更新时间轴
function updateTimeline() {
    const timeline = document.getElementById('progressTimeline');
    if (!timeline) return;
    
    timeline.innerHTML = '';
    
    // 收集所有更新
    const allUpdates = [];
    
    appState.members.forEach(member => {
        Object.entries(member.monthlyData).forEach(([monthId, data]) => {
            if (data.lastModified) {
                allUpdates.push({
                    member: member.name,
                    memberId: member.id,
                    month: monthId,
                    content: data.content,
                    date: new Date(data.lastModified),
                    type: data.submitted ? 'submitted' : 'draft'
                });
            }
        });
    });
    
    // 按日期排序
    allUpdates.sort((a, b) => b.date - a.date);
    
    // 只显示最近的10条
    const recentUpdates = allUpdates.slice(0, 10);
    
    if (recentUpdates.length === 0) {
        timeline.innerHTML = '<p class="no-updates">暂无更新记录</p>';
        return;
    }
    
    recentUpdates.forEach(update => {
        const monthInfo = appState.months.find(m => m.id === update.month);
        const monthName = monthInfo ? monthInfo.name : update.month;
        
        const updateElement = document.createElement('div');
        updateElement.className = 'timeline-item';
        updateElement.innerHTML = `
            <div class="timeline-content">
                <div class="timeline-header">
                    <strong>${update.member}</strong>
                    <span class="timeline-date">${update.date.toLocaleString()}</span>
                </div>
                <div class="timeline-month">${monthName}</div>
                <div class="timeline-text">${update.content.substring(0, 100)}${update.content.length > 100 ? '...' : ''}</div>
                <span class="timeline-status ${update.type}">
                    ${update.type === 'submitted' ? '已提交' : '草稿'}
                </span>
            </div>
        `;
        
        timeline.appendChild(updateElement);
    });
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 自动移除
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 辅助函数
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    const fileTypes = {
        'pdf': 'pdf',
        'doc': 'word',
        'docx': 'word',
        'txt': 'alt',
        'ppt': 'powerpoint',
        'pptx': 'powerpoint',
        'xls': 'excel',
        'xlsx': 'excel',
        'jpg': 'image',
        'jpeg': 'image',
        'png': 'image',
        'gif': 'image',
        'zip': 'archive',
        'rar': 'archive',
        '7z': 'archive'
    };
    
    return fileTypes[extension] || 'file';
}

function clearEditor() {
    const editor = document.getElementById('progressEditor');
    if (editor) {
        editor.innerHTML = '';
    }
}

function downloadFile(fileId) {
    const member = appState.currentMember 
        ? appState.members.find(m => m.id === appState.currentMember)
        : null;
    
    if (!member) return;
    
    const file = member.files.find(f => f.id === fileId);
    if (!file || !file.file) {
        alert('文件不存在或无法下载！');
        return;
    }
    
    const url = URL.createObjectURL(file.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function deleteFile(fileId) {
    if (!confirm('确定要删除这个文件吗？')) {
        return;
    }
    
    const member = appState.currentMember 
        ? appState.members.find(m => m.id === appState.currentMember)
        : null;
    
    if (!member) return;
    
    member.files = member.files.filter(f => f.id !== fileId);
    
    Object.keys(member.monthlyData).forEach(monthKey => {
        if (member.monthlyData[monthKey] && member.monthlyData[monthKey].files) {
            member.monthlyData[monthKey].files = member.monthlyData[monthKey].files.filter(f => f.id !== fileId);
        }
    });
    
    updateFileList();
    saveToLocalStorage();
    showNotification('文件已删除', 'info');
}