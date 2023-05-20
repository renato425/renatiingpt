const cookieParser = require('cookie-parser')
const express = require('express')
const app = express()
const path = require('path')
const openai = require('openai')
const configuration = new openai.Configuration({
    apiKey: process.env.API
})
const chat = new openai.OpenAIApi(configuration)

app.set('view engine', 'ejs')
app.use(cookieParser())
app.use(express.json())

app.get('/', (req, res) => {
    res.render(path.resolve(__dirname, 'view', 'index.ejs'), {
        cookies: req.cookies.chat || null
    })

})

app.post('/api/addQuestion', (req, res) => {
    const cookies = req.cookies.chat || []
    cookies.push({type: req.body.type, question: req.body.question})
    res.cookie('chat', cookies).sendStatus(200)
})

app.get('/api/consulteOpenAi', async (req, res) => {
    const cookies = req.cookies.chat || []
    const log = []
    for (const i in cookies) {
        if (cookies[i].type == 'user') {
            log.push({
                role: 'user',
                content: cookies[i].question
            })
        }
    }
    const result = await chat.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: log
    })
    const newCookies = req.cookies.chat
    newCookies.push({
        type: 'chat',
        question: result.data.choices[0].message.content
    })
    await res.cookie('chat', cookies).json({reply: result.data.choices[0].message.content})
})

app.delete('/', (req, res) => {
    res.clearCookie('chat').sendStatus(200)
})

app.listen(80, () => {
    console.log('online')
})
