class VideoSubtitleProcessor {
    constructor() {
        this.videoFile = null;
        this.srtFile = null;
        this.subtitles = [];
        this.init();
    }

    init() {
        const videoInput = document.getElementById('videoFile');
        const srtInput = document.getElementById('srtFile');
        const processBtn = document.getElementById('processBtn');

        videoInput.addEventListener('change', (e) => {
            this.videoFile = e.target.files[0];
            this.checkReadyToProcess();
        });

        srtInput.addEventListener('change', (e) => {
            this.srtFile = e.target.files[0];
            this.checkReadyToProcess();
        });

        processBtn.addEventListener('click', () => {
            this.processFiles();
        });
    }

    checkReadyToProcess() {
        const processBtn = document.getElementById('processBtn');
        processBtn.disabled = !(this.videoFile && this.srtFile);
    }

    async processFiles() {
        try {
            this.showProgress();
            
            // 解析SRT字幕
            await this.parseSRT();
            
            // 處理視頻並提取截圖
            await this.processVideo();
            
            // 顯示結果
            this.displayResults();
            
        } catch (error) {
            console.error('處理檔案時發生錯誤:', error);
            alert('處理檔案時發生錯誤，請檢查檔案格式是否正確。');
        }
    }

    showProgress() {
        document.getElementById('progressSection').style.display = 'block';
        document.getElementById('mainContent').style.display = 'none';
    }

    updateProgress(percent, text) {
        document.getElementById('progressFill').style.width = percent + '%';
        document.getElementById('progressText').textContent = text;
    }

    async parseSRT() {
        this.updateProgress(20, '解析字幕檔案...');
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const srtContent = e.target.result;
                    this.subtitles = this.parseSRTContent(srtContent);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(this.srtFile, 'utf-8');
        });
    }

    parseSRTContent(content) {
        const subtitles = [];
        const blocks = content.trim().split(/\n\s*\n/);
        
        blocks.forEach(block => {
            const lines = block.trim().split('\n');
            if (lines.length >= 3) {
                const index = parseInt(lines[0]);
                const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/);
                
                if (timeMatch) {
                    const startTime = this.timeToSeconds(timeMatch[1], timeMatch[2], timeMatch[3], timeMatch[4]);
                    const endTime = this.timeToSeconds(timeMatch[5], timeMatch[6], timeMatch[7], timeMatch[8]);
                    const text = lines.slice(2).join('\n');
                    
                    subtitles.push({
                        index,
                        startTime,
                        endTime,
                        text: text.replace(/<[^>]*>/g, '') // 移除HTML標籤
                    });
                }
            }
        });
        
        return subtitles;
    }

    timeToSeconds(hours, minutes, seconds, milliseconds) {
        return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds) + parseInt(milliseconds) / 1000;
    }

    async processVideo() {
        this.updateProgress(40, '處理影片檔案...');
        
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            video.onloadedmetadata = () => {
                canvas.width = 640;
                canvas.height = (video.videoHeight / video.videoWidth) * 640;
                
                const duration = video.duration;
                const frames = [];
                const interval = 30; // 每30秒截一張圖
                
                let currentTime = 0;
                const captureFrame = () => {
                    if (currentTime >= duration) {
                        this.frames = frames;
                        resolve();
                        return;
                    }
                    
                    video.currentTime = currentTime;
                    
                    video.onseeked = () => {
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const imageData = canvas.toDataURL('image/jpeg', 0.8);
                        
                        frames.push({
                            timestamp: currentTime,
                            image: imageData
                        });
                        
                        currentTime += interval;
                        this.updateProgress(40 + (currentTime / duration) * 40, `擷取影片截圖... ${Math.floor(currentTime)}s`);
                        
                        setTimeout(captureFrame, 100);
                    };
                };
                
                captureFrame();
            };
            
            video.onerror = reject;
            video.src = URL.createObjectURL(this.videoFile);
        });
    }

    getSubtitleAtTime(timestamp) {
        for (let subtitle of this.subtitles) {
            if (timestamp >= subtitle.startTime && timestamp <= subtitle.endTime) {
                return subtitle;
            }
        }
        
        // 如果沒有找到確切匹配的字幕，尋找最接近的
        let closest = null;
        let minDistance = Infinity;
        
        for (let subtitle of this.subtitles) {
            const distance = Math.min(
                Math.abs(timestamp - subtitle.startTime),
                Math.abs(timestamp - subtitle.endTime)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closest = subtitle;
            }
        }
        
        return closest;
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    displayResults() {
        this.updateProgress(100, '完成！');
        
        setTimeout(() => {
            document.getElementById('progressSection').style.display = 'none';
            document.getElementById('mainContent').style.display = 'grid';
            
            this.renderFrames();
            this.renderSubtitles();
        }, 1000);
    }

    renderFrames() {
        const container = document.getElementById('framesContainer');
        container.innerHTML = '';
        
        if (!this.frames || this.frames.length === 0) {
            container.innerHTML = '<div class="empty-state">沒有找到影片截圖</div>';
            return;
        }
        
        this.frames.forEach((frame, index) => {
            const frameElement = document.createElement('div');
            frameElement.className = 'frame-item';
            frameElement.innerHTML = `
                <div class="frame-timestamp">${this.formatTime(frame.timestamp)}</div>
                <img src="${frame.image}" alt="Frame at ${this.formatTime(frame.timestamp)}" loading="lazy">
            `;
            container.appendChild(frameElement);
        });
    }

    renderSubtitles() {
        const container = document.getElementById('subtitlesContainer');
        container.innerHTML = '';
        
        if (!this.frames || this.frames.length === 0) {
            container.innerHTML = '<div class="empty-state">沒有對應的字幕</div>';
            return;
        }
        
        this.frames.forEach((frame, index) => {
            const subtitle = this.getSubtitleAtTime(frame.timestamp);
            const subtitleElement = document.createElement('div');
            subtitleElement.className = 'subtitle-item';
            
            if (subtitle) {
                subtitleElement.innerHTML = `
                    <div class="subtitle-timestamp">${this.formatTime(frame.timestamp)}</div>
                    <div class="subtitle-text">${subtitle.text}</div>
                `;
            } else {
                subtitleElement.innerHTML = `
                    <div class="subtitle-timestamp">${this.formatTime(frame.timestamp)}</div>
                    <div class="subtitle-text" style="color: #999; font-style: italic;">此時間點沒有字幕</div>
                `;
            }
            
            container.appendChild(subtitleElement);
        });
    }
}

// 初始化應用程式
document.addEventListener('DOMContentLoaded', () => {
    new VideoSubtitleProcessor();
});