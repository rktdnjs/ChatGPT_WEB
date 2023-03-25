const APIKEY = "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";
const { Configuration, OpenAIApi } = require("openai");
const express = require("express"); // express 불러와서 앱으로 만들고 get요청이 오면 3000번 포트에 돌려주겠다.
const app = express();
var cors = require("cors");

const configuration = new Configuration({
  apiKey: APIKEY,
});

const openai = new OpenAIApi(configuration);

// CORS 이슈 해결
// let corsOptions = {
//     origin: 'https://www.domain.com',
//     credentials: true
// }

app.use(cors());

// JSON형태로 프론트엔드쪽의 요청이 들어왔을 경우, 이를 처리하기 위해 아래 두 줄 필요
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// POST method route
// POST로 바꾸면, body값을 받아야 한다.
// 프론트엔드에서 어떤 요청을 보냈을 때, 백엔드에서 값을 읽어야 하기 때문에
// body를 읽기 위해서 Express에서 설정해주어야 하는 것이 있다.
app.get("/fortuneTell", async function (req, res) {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      // max_tokens: 100, 여기서 Chat 부분에서 사용하던 파라미터를 추가할 수 있음
      // temperature: 0.5,
      messages: [
        {role: "system", content: "당신은 세계 최고의 점성술사입니다. 당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신의 이름은 챗도지이며, 당신은 사람의 인생을 매우 명확하게 예측하고 운세에 대한 답을 줄 수 있습니다. 운세 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다."},
        {role: "user", content: "당신은 세계 최고의 점성술사입니다. 당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신의 이름은 챗도지이며, 당신은 사람의 인생을 매우 명확하게 예측하고 운세에 대한 답을 줄 수 있습니다. 운세 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다."},
        {role: "assistant", content: "안녕하세요, 저는 챗도지입니다. 무엇을 도와드릴까요? 운세에 관심이 있으시다면, 저는 이에 대해서도 답변해드릴 수 있습니다."},
        { role: "user", content: "오늘의 운세가 뭐야?" },
      ],
    });
    let fortune = completion.data.choices[0].message["content"]
    console.log(fortune);
    res.send(fortune);
});

app.listen(3000);
