const APIKEY = "(API 키 입력)";
const { Configuration, OpenAIApi } = require("openai");
const serverless = require('serverless-http');
const express = require("express"); // express 불러와서 앱으로 만들고 get요청이 오면 3000번 포트에 돌려주겠다.
const app = express();
var cors = require("cors");

const configuration = new Configuration({
  apiKey: APIKEY,
});

const openai = new OpenAIApi(configuration);

// CORS 이슈 해결
let corsOptions = {
    origin: '(배포한 프론트엔드 주소 입력)', // 프론트엔드 사이트 주소, 여기에서 날라오는 요청이 아니면 전부 거절함
    credentials: true
}

app.use(cors());

// JSON형태로 프론트엔드쪽의 요청이 들어왔을 경우, 이를 처리하기 위해 아래 두 줄 필요
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// POST method route
// POST로 바꾸면, body값을 받아야 한다.
// 프론트엔드에서 어떤 요청을 보냈을 때, 백엔드에서 값을 읽어야 하기 때문에
// body를 읽기 위해서 Express에서 설정해주어야 하는 것이 있다.
app.post("/fortuneTell", async function (req, res) {
    let {myDateTime, userMessages, assistantMessages} = req.body;

    let todayDateTime = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    let messages = [
        {role: "system", content: "당신은 세계 최고의 점성술사입니다. 당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신의 이름은 챗토끼이며, 당신은 사람의 인생을 매우 명확하게 예측하고 운세에 대한 답을 줄 수 있습니다. 운세 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다."},
        {role: "user", content: "당신은 세계 최고의 점성술사입니다. 당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신의 이름은 챗토끼이며, 당신은 사람의 인생을 매우 명확하게 예측하고 운세에 대한 답을 줄 수 있습니다. 운세 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다."},
        {role: "assistant", content: "안녕하세요! 저는 챗토끼입니다. 운세와 점성술에 관한 질문이 있으신가요? 어떤 것이든 물어보세요, 최선을 다해, 그리고 무엇이든지 반드시 답변해 드리겠습니다."},
        {role: "user", content: `저의 생년월일과 태어난 시간은 ${myDateTime}입니다. 오늘은 ${todayDateTime}입니다.`},
        {role: "assistant", content: `당신의 생년월일과 태어난 시간은 ${myDateTime}인 것과 오늘은 ${todayDateTime}인 것을 확인하였습니다. 운세에 대해서 어떤 것이든 물어보세요!`},
    ]

    while (userMessages.length != 0 || assistantMessages != 0) {
        if(userMessages.length != 0){
            messages.push( // 유저가 보낸 메세지를 온 순서대로 뽑아서 개행문자 처리 등 한다음에 사용
                JSON.parse('{"role": "user", "content": "'+String(userMessages.shift()).replace(/\n/g,"")+'"}')
            )   
        }
        if(assistantMessages.length != 0){
            messages.push( // 유저가 보낸 메세지를 온 순서대로 뽑아서 개행문자 처리 등 한다음에 사용
                JSON.parse('{"role": "assistant", "content": "'+String(assistantMessages.shift()).replace(/\n/g,"")+'"}')
            )   
        }
    }

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      // max_tokens: 100, 여기서 Chat 부분에서 사용하던 파라미터를 추가할 수 있음
      // temperature: 0.5,
      messages: messages
    });
    let fortune = completion.data.choices[0].message["content"]
    // console.log(fortune);
    res.json({"assistant" : fortune});
});

// express로 만든 앱을 서버리스 모듈을 이용해서 내보냄, 이를 통해 AWS람다를 사용!
module.exports.handler = serverless(app);

// app.listen(3000);