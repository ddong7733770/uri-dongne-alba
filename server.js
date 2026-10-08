const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get('/api/jobs', async (req, res) => {
    let jobs = []; // 가져올 데이터를 담을 빈 바구니

    try {
        // 1. 변경된 알바몬의 유효한 주소로 다시 시도합니다.
        const targetUrl = 'https://www.albamon.com/jobs/area'; 
        
        const response = await axios.get(targetUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });

        const $ = cheerio.load(response.data);

        $('.job-list-item').each((index, element) => {
            if (index < 5) {
                jobs.push({
                    site: '알바몬(크롤링)',
                    siteClass: 'albamon',
                    company: $(element).find('.company-name').text() || '스타벅스 죽전역점',
                    title: $(element).find('.job-title').text() || '매장 관리 및 바리스타 (크롤링 테스트)',
                    distance: '1.5km',
                    walk: '🚶 20분', car: '🚗 5분'
                });
            }
        });

    } catch (error) {
        // 알바몬에서 로봇 접속을 막거나 에러가 나면 이쪽으로 빠집니다.
        console.error("크롤링 중단됨 (예비 데이터로 전환):", error.message);
    } finally {
        // 2. 크롤링에 실패했더라도, 빈 화면 대신 예비 데이터를 화면에 띄워줍니다.
        if (jobs.length === 0) {
            jobs.push(
                { site: '서버연결성공', siteClass: 'albamon', company: '크롤링 안전장치 작동', title: '서버와 정상적으로 통신하고 있습니다.', distance: '1.0km', walk: '🚶 15분', car: '🚗 5분' },
                { site: '시스템알림', siteClass: 'albacheonguk', company: '데이터 수집 대기중', title: '알바 사이트의 실제 구조에 맞춰 크롤링 규칙을 수정해야 합니다.', distance: '2.5km', walk: '🚶 30분', car: '🚗 8분' }
            );
        }
        
        // 화면으로 데이터 전송
        res.json({ success: true, data: jobs });
    }
});

app.listen(PORT, () => {
    console.log(`서버 정상 실행 중...`);
});
