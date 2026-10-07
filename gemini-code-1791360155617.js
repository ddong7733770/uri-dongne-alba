const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// 알바 데이터 스크래핑 API
app.get('/api/jobs', async (req, res) => {
    try {
        const { query = '강남구' } = req.query; 
        
        // 주의: 실제 서비스 시 알바몬/알바천국은 봇 차단(Cloudflare 등)이 있을 수 있습니다.
        // 여기서는 예시로 검색 쿼리를 통한 스크래핑 구조를 제공합니다.
        const searchUrl = `https://www.alba.co.kr/job/search/SearchTotal.asp?keyword=${encodeURIComponent(query)}`;
        
        const response = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        
        const $ = cheerio.load(response.data);
        const jobs = [];

        // 실제 사이트의 HTML 구조에 맞춰 선택자(Selector)를 수정해야 합니다. (아래는 범용적 예시)
        $('.jobResult table tbody tr').each((index, element) => {
            if (index >= 15) return false; // 최대 15개만 가져오기
            
            const company = $(element).find('.company').text().trim() || '기업명 비공개';
            const title = $(element).find('.title a').text().trim();
            const location = $(element).find('.area').text().trim();
            const link = $(element).find('.title a').attr('href');
            
            if (title && company) {
                jobs.push({
                    id: index,
                    company: company,
                    title: title,
                    location: location,
                    link: `https://www.alba.co.kr${link}`,
                    source: '알바천국',
                    // 데모용 가상 좌표 산출 로직 (실제 서비스 시 주소->좌표 변환 API 필요)
                    lat: 37.4979 + (Math.random() - 0.5) * 0.05,
                    lng: 127.0276 + (Math.random() - 0.5) * 0.05,
                    distance: (Math.random() * 5).toFixed(1)
                });
            }
        });

        res.json({ success: true, jobs });
    } catch (error) {
        console.error('Scraping Error:', error.message);
        res.status(500).json({ success: false, message: '채용 정보를 불러오는 데 실패했습니다.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});