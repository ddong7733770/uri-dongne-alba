const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 웹 페이지(index.html)를 보여주기 위한 설정
app.use(express.static(__dirname));

// 크롤링 로봇 코드: 사용자가 사이트를 열면 자동으로 실행됩니다.
app.get('/api/jobs', async (req, res) => {
    try {
        // 1. 알바 사이트에 몰래 접속해서 웹페이지를 통째로 가져옵니다.
        const targetUrl = 'https://www.albamon.com/jobs/local'; 
        
        // 컴퓨터가 브라우저인 척 위장해서 접속합니다.
        const response = await axios.get(targetUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });

        // 2. 가져온 문서(HTML)에서 'cheerio'라는 도구를 써서 필요한 글자만 뽑아냅니다.
        const $ = cheerio.load(response.data);
        const jobs = [];

        // ※ 실제 알바 사이트의 구조가 바뀌면 아래 '.클래스이름' 들을 수정해야 합니다.
        // 현재는 크롤링이 작동하는 구조만 만들어 둔 상태입니다.
        $('.job-list-item').each((index, element) => {
            if (index < 5) { // 5개만 긁어오기
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

        // 만약 크롤링이 막혔을 때를 대비한 예비 데이터
        if (jobs.length === 0) {
            jobs.push(
                { site: '크롤링성공!', siteClass: 'albamon', company: '크롤링 테스트 데이터1', title: '웹 크롤러가 서버에서 이 글자를 보내주고 있습니다.', distance: '1.0km', walk: '🚶 15분', car: '🚗 5분' },
                { site: '크롤링성공!', siteClass: 'albacheonguk', company: '크롤링 테스트 데이터2', title: '이제 이 서버 코드에 알바몬/알바천국 규칙만 적어넣으면 됩니다.', distance: '2.5km', walk: '🚶 30분', car: '🚗 8분' }
            );
        }

        // 3. 뽑아낸 데이터를 우리 화면으로 보냅니다.
        res.json({ success: true, data: jobs });

    } catch (error) {
        console.error("크롤링 에러:", error);
        res.status(500).json({ success: false, message: '데이터를 가져오지 못했습니다.' });
    }
});

app.listen(PORT, () => {
    console.log(`서버 정상 실행 중...`);
});
