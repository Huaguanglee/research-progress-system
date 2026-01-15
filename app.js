// 应用状态管理
class ResearchProgressSystem {
    constructor() {
        this.members = [];
        this.currentMember = null;
        this.currentMonth = null;
        this.months = [];
        this.autoSaveInterval = null;
        
        this.init();
    }

    init() {
        this.initializeMonths();
        this.initializeMembers();
        this.renderUI();
        this.setupEventListeners();
        this.loadFromStorage();
        this.startAutoSave();
        
        this.showNotification('系统初始化完成！', 'success');
    }

    initializeMonths() {
        const startDate = new Date(2025, 0, 1); // 2025年1月开始
        this.months = [];
        
        for (let i = 0; i < 12; i++) {
            const date = new Date(startDate);
            date.setMonth(startDate.getMonth() + i);
            const monthId = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = `${date.getFullYear()}年${date.getMonth() + 1}月`;
            
            this.months.push({
                id: monthId,
                name: monthName,
                year: date.getFullYear(),
                month: date.getMonth() + 1
            });
        }
        
        // 设置当前月份为第一个月
        this.currentMonth = this.months[0]?.id || null;
    }

    initializeMembers() {
        // 8个团队成员
        const membersData = [
            { name: '张三', research: '机器学习与数据挖掘', status: 'active' },
            { name: '李四', research: '自然语言处理', status: 'active' },
            { name: '王五', research: '计算机视觉', status: 'warning' },
            { name: '赵六', research: '人工智能理论', status: 'active' },
            { name: '刘七', research: '知识图谱与推理', status: 'active' },
            { name: '陈八', research: '智能系统', status: 'danger' },
            { name: '杨九', research: '人机交互', status: 'active' },
            { name: '吴十', research: '强化学习', status: 'active' }
        ];

        this.members = membersData.map((member, index) => {
            const memberId = `RES${String(index + 1).padStart(3, '0')}`;
            return {
                id: memberId,
                name: member.name,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=667eea&color=fff&size=128`,
                research: member.research,
                status: member.status,
                progress: Math.floor(Math.random() * 100),
                files: [],
                monthlyData: {},
                lastUpdate: null
            };
        });
    }

    renderUI() {
        this.renderMemberGrid();
        this.renderMonthButtons();
        this.renderMemberSelect();
        this.updateStats();
        this.renderTimeline();
    }

    renderMemberGrid() {
        const grid = document.getElementById('membersGrid');
        if (!grid) return;

        grid.innerHTML = '';

        this.members.forEach(member => {
            const monthlyData = member.monthlyData[this.currentMonth] || {};
            const progressPercent = member.progress || 0;
            
            const card = document.createElement('div');
            card.className = 'member-card';
            card.innerHTML = `
                <div class="member-header">
                    <img src="${member.avatar}" alt="${member.name}" class="member-avatar">
                    <div class="member-info">
                        <h3>${member.name}</h3>
                        <span class="member-id">${member.id}</span>
                        ${member.status !== 'active' ? 
                            `<span class="status-badge ${member.status}">
                                <i class="fas fa-exclamation-triangle"></i>
                                ${member.status === 'warning' ? '需关注' : '滞后'}
                            </span>` : ''
                        }
                    </div>
                </div>
                <div class="member-research">
                    <span class="research-tag">${member.research}</span>
                </div>
                <div class="member-stats">
                    <div class="stat-item">
                        <div class="stat-value">${Object.keys(member.monthlyData).length}</div>
                        <div class="stat-label">完成月份</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${member.files.length}</div>
                        <div class="stat-label">文件数</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${progressPercent}%</div>
                        <div class="stat-label">总进度</div>
                    </div>
                </div>
                <div class="current-month">
                    <div class="month-label">
                        <span>${this.months[0]?.name || '当前月份'}</span>
                        <span>进度</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="progress-text">
                        ${monthlyData.content ? 
                            monthlyData.content.replace(/<[^>]*>/g, '').substring(0, 60) + '...' : 
                            '暂无进展记录'}
                    </div>
                </div>
                <div class="member-actions">
                    <button class="btn btn-sm btn-outline view-details" data-member="${member.id}">
                        <i class="fas fa-eye"></i> 查看详情
                    </button>
                    <button class="btn btn-sm btn-primary edit-progress" data-member="${member.id}">
                        <i class="fas fa-edit"></i> 编辑进展
                    </button>
                </div>
            `;

            grid.appendChild(card);
        });

        // 添加事件监听器
        grid.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', (e) => this.showMemberDetails(e.target.dataset.member));
        });

        grid.querySelectorAll('.edit-progress').forEach(btn => {
            btn.addEventListener('click', (e) => this.editMemberProgress(e.target.dataset.member));
        });
    }

    renderMonthButtons() {
        const container = document.getElementById('monthButtons');
        if (!container) return;

        container.innerHTML = '';

        this.months.forEach(month => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `month-btn ${month.id === this.currentMonth ? 'active' : ''}`;
            button.textContent = month.name;
            button.dataset.month = month.id;
            button.addEventListener('click', () => this.selectMonth(month.id));
            container.appendChild(button);
        });
    }

    renderMemberSelect() {
        const select = document.getElementById('memberSelect');
        if (!select) return;

        select.innerHTML = '<option value="">请选择团队成员</option>';
        
        this.members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = `${member.name} (${member.id}) - ${member.research}`;
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => this.selectMember(e.target.value));
    }

    selectMember(memberId) {
        this.currentMember = memberId;
        this.loadMemberProgress();
    }

    selectMonth(monthId) {
        this.currentMonth = monthId;
        
        // 更新按钮状态
        document.querySelectorAll('.month-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.month === monthId);
        });
        
        this.loadMemberProgress();
    }

    loadMemberProgress() {
        if (!this.currentMember || !this.currentMonth) {
            document.getElementById('progressEditor').innerHTML = 
                '<p>请先选择成员和月份...</p>';
            return;
        }

        const member = this.members.find(m => m.id === this.currentMember);
        if (!member) return;

        const editor = document.getElementById('progressEditor');
        if (!editor) return;

        const monthlyData = member.monthlyData[this.currentMonth];
        editor.innerHTML = monthlyData?.content || 
            `<p>请在此编辑${this.getMonthName(this.currentMonth)}的科研进展...</p>
             <p>包括：实验进展、数据分析、论文撰写、问题与解决方案、下月计划等。</p>`;

        this.updateFileList();
        this.updateCharCount();
    }

    updateFileList() {
        const container = document.getElementById('uploadedFiles');
        if (!container) return;

        if (!this.currentMember || !this.currentMonth) {
            container.innerHTML = '<p class="no-files">请先选择成员和月份</p>';
            return;
        }

        const member = this.members.find(m => m.id === this.currentMember);
        if (!member) return;

        const monthlyData = member.monthlyData[this.currentMonth];
        const files = monthlyData?.files || [];

        if (files.length === 0) {
            container.innerHTML = '<p class="no-files">本月暂无上传文件</p>';
            return;
        }

        container.innerHTML = files.map(file => `
            <div class="file-item" data-file="${file.id}">
                <div class="file-info">
                    <i class="fas fa-file-${this.getFileIcon(file.type)} file-icon"></i>
                    <div>
                        <div class="file-name">${file.name}</div>
                        <div class="file-meta">${file.size} • ${new Date(file.uploadDate).toLocaleDateString()}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="btn-icon download-file" title="下载">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-icon delete-file" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // 添加事件监听器
        container.querySelectorAll('.delete-file').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const fileItem = e.target.closest('.file-item');
                const fileId = fileItem.dataset.file;
                this.deleteFile(fileId);
            });
        });
    }

    getFileIcon(fileType) {
        const icons = {
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
            'zip': 'archive',
            'rar': 'archive'
        };
        return icons[fileType] || 'file';
    }

    getMonthName(monthId) {
        const month = this.months.find(m => m.id === monthId);
        return month ? month.name : '未知月份';
    }

    setupEventListeners() {
        // 编辑器工具栏
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const command = btn.dataset.command;
                const value = btn.dataset.value;
                document.execCommand(command, false, value);
            });
        });

        // 文件上传
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const browseLink = document.getElementById('browseFiles');

        if (uploadArea) {
            uploadArea.addEventListener('click', () => fileInput.click());
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
            });
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.style.backgroundColor = '';
            });
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.backgroundColor = '';
                this.handleFileUpload(e.dataTransfer.files);
            });
        }

        if (browseLink) {
            browseLink.addEventListener('click', (e) => {
                e.preventDefault();
                fileInput.click();
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e.target.files));
        }

        // 按钮事件
        const saveBtn = document.getElementById('saveBtn');
        const submitBtn = document.getElementById('submitBtn');
        const clearBtn = document.getElementById('clearBtn');
        const exportBtn = document.getElementById('exportBtn');
        const refreshBtn = document.getElementById('refreshBtn');

        if (saveBtn) saveBtn.addEventListener('click', () => this.saveProgress());
        if (submitBtn) submitBtn.addEventListener('click', () => this.submitProgress());
        if (clearBtn) clearBtn.addEventListener('click', () => this.clearEditor());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportData());
        if (refreshBtn) refreshBtn.addEventListener('click', () => location.reload());

        // 模态框
        const modalClose = document.querySelector('.modal-close');
        const modal = document.getElementById('memberModal');

        if (modalClose) {
            modalClose.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }

        // 导航
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                e.target.classList.add('active');
                
                const page = e.target.dataset.page;
                this.showPage(page);
            });
        });

        // 编辑器输入监听
        const editor = document.getElementById('progressEditor');
        if (editor) {
            editor.addEventListener('input', () => this.updateCharCount());
        }
    }

    updateCharCount() {
        const editor = document.getElementById('progressEditor');
        const charCount = document.getElementById('charCount');
        if (!editor || !charCount) return;

        const text = editor.innerText.replace(/\s+/g, ' ').trim();
        const charLength = text.length;
        charCount.textContent = `${charLength} 字`;
    }

    async handleFileUpload(files) {
        if (!files || files.length === 0) return;
        if (!this.currentMember || !this.currentMonth) {
            this.showNotification('请先选择成员和月份！', 'warning');
            return;
        }

        const member = this.members.find(m => m.id === this.currentMember);
        if (!member) return;

        for (const file of files) {
            if (file.size > 50 * 1024 * 1024) { // 50MB
                this.showNotification(`文件 ${file.name} 超过50MB限制！`, 'error');
                continue;
            }

            const fileData = {
                id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name: file.name,
                size: this.formatFileSize(file.size),
                type: file.name.split('.').pop().toLowerCase(),
                uploadDate: new Date().toISOString(),
                data: await this.readFileAsBase64(file)
            };

            if (!member.monthlyData[this.currentMonth]) {
                member.monthlyData[this.currentMonth] = { files: [] };
            }

            if (!member.monthlyData[this.currentMonth].files) {
                member.monthlyData[this.currentMonth].files = [];
            }

            member.monthlyData[this.currentMonth].files.push(fileData);
            member.files.push(fileData);

            this.showNotification(`已上传: ${file.name}`, 'success');
        }

        this.updateFileList();
        this.saveToStorage();
        this.updateStats();
    }

    readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    deleteFile(fileId) {
        if (!this.currentMember) return;

        const member = this.members.find(m => m.id === this.currentMember);
        if (!member) return;

        // 从所有位置删除文件
        member.files = member.files.filter(f => f.id !== fileId);
        
        Object.keys(member.monthlyData).forEach(month => {
            if (member.monthlyData[month]?.files) {
                member.monthlyData[month].files = member.monthlyData[month].files.filter(f => f.id !== fileId);
            }
        });

        this.updateFileList();
        this.saveToStorage();
        this.updateStats();
        this.showNotification('文件已删除', 'info');
    }

    saveProgress() {
        if (!this.currentMember || !this.currentMonth) {
            this.showNotification('请先选择成员和月份！', 'warning');
            return;
        }

        const editor = document.getElementById('progressEditor');
        if (!editor) return;

        const content = editor.innerHTML.trim();
        if (!content || content === '<p><br></p>') {
            this.showNotification('请输入进展内容！', 'warning');
            return;
        }

        const member = this.members.find(m => m.id === this.currentMember);
        if (!member) return;

        if (!member.monthlyData[this.currentMonth]) {
            member.monthlyData[this.currentMonth] = {};
        }

        member.monthlyData[this.currentMonth] = {
            ...member.monthlyData[this.currentMonth],
            content: content,
            lastModified: new Date().toISOString(),
            submitted: false
        };

        // 更新进度
        const completedMonths = Object.keys(member.monthlyData).filter(
            month => member.monthlyData[month]?.content
        ).length;
        member.progress = Math.min(100, Math.round((completedMonths / 12) * 100));

        member.lastUpdate = new Date().toISOString();
        member.status = 'active';

        this.saveToStorage();
        this.renderMemberGrid();
        this.updateStats();
        this.updateTimeline('save', {
            member: member.name,
            month: this.getMonthName(this.currentMonth)
        });

        this.showNotification('进展已保存！', 'success');
    }

    submitProgress() {
        if (!this.currentMember || !this.currentMonth) {
            this.showNotification('请先选择成员和月份！', 'warning');
            return;
        }

        const member = this.members.find(m => m.id === this.currentMember);
        if (!member || !member.monthlyData[this.currentMonth]?.content) {
            this.showNotification('请先保存进展内容！', 'warning');
            return;
        }

        member.monthlyData[this.currentMonth].submitted = true;
        member.monthlyData[this.currentMonth].submittedAt = new Date().toISOString();

        this.saveToStorage();
        this.renderMemberGrid();
        this.updateTimeline('submit', {
            member: member.name,
            month: this.getMonthName(this.currentMonth)
        });

        this.showNotification('进展已提交给导师！', 'success');
    }

    clearEditor() {
        if (!confirm('确定要清空编辑器内容吗？')) return;
        
        const editor = document.getElementById('progressEditor');
        if (editor) {
            editor.innerHTML = '<p>请在此编辑本月科研进展...</p>';
            this.updateCharCount();
        }
    }

    exportData() {
        const exportData = {
            exportDate: new Date().toISOString(),
            system: '学术科研进展管理系统',
            version: '1.0.0',
            data: this.members.map(member => ({
                id: member.id,
                name: member.name,
                research: member.research,
                progress: member.progress,
                lastUpdate: member.lastUpdate,
                monthlyData: member.monthlyData,
                files: member.files.map(f => ({
                    name: f.name,
                    size: f.size,
                    type: f.type,
                    uploadDate: f.uploadDate
                }))
            }))
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `科研进展报告_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('数据导出成功！', 'success');
    }

    updateStats() {
        const totalMembers = this.members.length;
        const totalProgress = Math.round(
            this.members.reduce((sum, m) => sum + (m.progress || 0), 0) / totalMembers
        );
        const totalFiles = this.members.reduce((sum, m) => sum + m.files.length, 0);
        
        const currentMonth = this.months[0]?.id;
        const monthSubmissions = this.members.filter(m => 
            m.monthlyData[currentMonth]?.submitted
        ).length;

        document.getElementById('totalMembers').textContent = totalMembers;
        document.getElementById('totalProgress').textContent = totalProgress + '%';
        document.getElementById('totalFiles').textContent = totalFiles;
        document.getElementById('monthSubmissions').textContent = monthSubmissions;
    }

    updateTimeline(action, data) {
        const timeline = document.getElementById('timeline');
        if (!timeline) return;

        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        
        let actionText = '';
        let icon = 'info-circle';
        
        switch (action) {
            case 'save':
                actionText = `${data.member} 保存了 ${data.month} 的进展`;
                icon = 'save';
                break;
            case 'submit':
                actionText = `${data.member} 提交了 ${data.month} 的进展`;
                icon = 'paper-plane';
                break;
            default:
                actionText = '系统更新';
        }

        timelineItem.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="timeline-date">刚刚</div>
                <div class="timeline-text">
                    <i class="fas fa-${icon}"></i> ${actionText}
                </div>
            </div>
        `;

        timeline.prepend(timelineItem);
        
        // 只保留最近的10条记录
        const items = timeline.querySelectorAll('.timeline-item');
        if (items.length > 10) {
            items[items.length - 1].remove();
        }
    }

    renderTimeline() {
        const timeline = document.getElementById('timeline');
        if (!timeline) return;

        // 这里可以添加从存储中加载时间轴记录的逻辑
    }

    showMemberDetails(memberId) {
        const member = this.members.find(m => m.id === memberId);
        if (!member) return;

        const modal = document.getElementById('memberModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalAvatar = document.getElementById('modalAvatar');
        const modalName = document.getElementById('modalName');
        const modalId = document.getElementById('modalId');
        const modalResearch = document.getElementById('modalResearch');
        const modalCompleted = document.getElementById('modalCompleted');
        const modalSubmitted = document.getElementById('modalSubmitted');
        const modalFiles = document.getElementById('modalFiles');
        const progressDetails = document.getElementById('progressDetails');

        if (!modal) return;

        // 更新基本信息
        modalTitle.textContent = `${member.name} 的详细进展`;
        modalAvatar.src = member.avatar;
        modalAvatar.alt = member.name;
        modalName.textContent = member.name;
        modalId.textContent = `学号/工号: ${member.id}`;
        modalResearch.textContent = `研究方向: ${member.research}`;

        // 更新统计数据
        const completedMonths = Object.keys(member.monthlyData).filter(
            month => member.monthlyData[month]?.content
        ).length;
        const submittedMonths = Object.keys(member.monthlyData).filter(
            month => member.monthlyData[month]?.submitted
        ).length;

        modalCompleted.textContent = completedMonths;
        modalSubmitted.textContent = submittedMonths;
        modalFiles.textContent = member.files.length;

        // 更新详细进展
        progressDetails.innerHTML = '';

        if (completedMonths === 0) {
            progressDetails.innerHTML = '<p class="no-data">暂无进展记录</p>';
        } else {
            // 按月份倒序排列
            const sortedMonths = Object.keys(member.monthlyData)
                .sort()
                .reverse();

            sortedMonths.forEach(monthId => {
                const data = member.monthlyData[monthId];
                if (!data?.content) return;

                const monthElement = document.createElement('div');
                monthElement.className = 'month-detail';
                monthElement.innerHTML = `
                    <div class="month-header">
                        <h4>${this.getMonthName(monthId)}</h4>
                        <span class="detail-date">
                            ${new Date(data.lastModified).toLocaleDateString()}
                            ${data.submitted ? '<span class="status-submitted">已提交</span>' : '<span class="status-draft">草稿</span>'}
                        </span>
                    </div>
                    <div class="month-content">${data.content}</div>
                    ${data.files?.length > 0 ? `
                        <div class="month-files">
                            <strong>相关文件 (${data.files.length}个):</strong>
                            <ul>
                                ${data.files.map(file => `<li>${file.name} (${file.size})</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                `;
                progressDetails.appendChild(monthElement);
            });
        }

        modal.style.display = 'flex';
    }

    editMemberProgress(memberId) {
        this.currentMember = memberId;
        
        const select = document.getElementById('memberSelect');
        if (select) {
            select.value = memberId;
        }
        
        this.loadMemberProgress();
        this.showNotification(`正在编辑 ${this.members.find(m => m.id === memberId)?.name} 的进展`, 'info');
    }

    showPage(pageId) {
        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
        document.querySelectorAll('section').forEach(s => s.style.display = 'none');
        
        // 显示目标页面
        const targetPage = pageId === 'dashboard' ? 'dashboardPage' : pageId + 'Page';
        const pageElement = document.getElementById(targetPage);
        if (pageElement) {
            pageElement.style.display = 'block';
            pageElement.classList.remove('hidden');
        }
    }

    showNotification(message, type = 'info') {
        if (typeof Toastify !== 'undefined') {
            Toastify({
                text: message,
                duration: 3000,
                gravity: "top",
                position: "right",
                backgroundColor: type === 'success' ? "#27ae60" : 
                              type === 'error' ? "#e74c3c" : 
                              type === 'warning' ? "#f39c12" : "#3498db",
                stopOnFocus: true
            }).showToast();
        } else {
            alert(message);
        }
    }

    saveToStorage() {
        try {
            const data = {
                members: this.members,
                lastSave: new Date().toISOString()
            };
            localStorage.setItem('researchProgressData', JSON.stringify(data));
            
            const status = document.getElementById('autoSaveStatus');
            if (status) {
                status.textContent = '已保存 ' + new Date().toLocaleTimeString();
                status.style.color = '#27ae60';
                
                setTimeout(() => {
                    status.textContent = '已保存';
                }, 2000);
            }
        } catch (error) {
            console.error('保存数据失败:', error);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('researchProgressData');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.members) {
                    // 合并保存的数据
                    this.members.forEach(member => {
                        const savedMember = data.members.find(m => m.id === member.id);
                        if (savedMember) {
                            Object.assign(member, {
                                monthlyData: savedMember.monthlyData || {},
                                files: savedMember.files || [],
                                progress: savedMember.progress || 0,
                                lastUpdate: savedMember.lastUpdate
                            });
                        }
                    });
                    
                    this.renderMemberGrid();
                    this.updateStats();
                    this.showNotification('已加载保存的数据', 'info');
                }
            }
        } catch (error) {
            console.error('加载数据失败:', error);
        }
    }

    startAutoSave() {
        // 每30秒自动保存一次
        this.autoSaveInterval = setInterval(() => {
            this.saveProgress();
        }, 30000);
    }
}

// 初始化应用
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new ResearchProgressSystem();
    
    // 添加一些CSS样式
    const style = document.createElement('style');
    style.textContent = `
        .toastify {
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: 'Roboto', 'Noto Serif SC', sans-serif;
        }
        
        .month-detail {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            border-left: 4px solid #3498db;
        }
        
        .month-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .month-header h4 {
            color: #2c3e50;
            margin: 0;
        }
        
        .detail-date {
            color: #7f8c8d;
            font-size: 0.9rem;
        }
        
        .month-content {
            line-height: 1.6;
            color: #333;
            margin-bottom: 10px;
        }
        
        .month-files {
            background: white;
            border-radius: 6px;
            padding: 10px;
            font-size: 0.9rem;
        }
        
        .month-files ul {
            margin: 5px 0 0 20px;
            padding: 0;
        }
        
        .month-files li {
            margin: 3px 0;
        }
        
        .status-submitted {
            background: #27ae60;
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.8rem;
            margin-left: 10px;
        }
        
        .status-draft {
            background: #f39c12;
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.8rem;
            margin-left: 10px;
        }
        
        .no-data {
            text-align: center;
            color: #7f8c8d;
            font-style: italic;
            padding: 20px;
        }
    `;
    document.head.appendChild(style);
});
