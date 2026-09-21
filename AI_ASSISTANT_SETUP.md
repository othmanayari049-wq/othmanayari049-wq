# AI portfolio assistant setup

The website now contains an **Ask about Othman** chat interface. The browser sends questions to `api/chat.js`; the API key remains on the server.

## 1. Deploy the API

1. Import this GitHub repository into Vercel.
2. In the Vercel project, add an environment variable named `OPENAI_API_KEY`.
3. Optionally add `OPENAI_MODEL`. If omitted, the function uses `gpt-5-mini`.
4. Deploy the project and copy its domain, for example `https://your-project.vercel.app`.

## 2. Connect GitHub Pages

Open `chat-config.js` and set:

```js
window.MOA_CHAT_API_URL = 'https://your-project.vercel.app/api/chat';
```

Commit and push the change. GitHub Pages will continue to host the website, while only assistant requests use the Vercel function.

## 3. Update what the assistant knows

Edit `data/profile-knowledge.txt`. Include only information that is accurate and safe to publish. The assistant is explicitly instructed not to answer beyond this approved profile.

## Security notes

- Never place `OPENAI_API_KEY` in `chat-config.js`, HTML, browser JavaScript, or the GitHub repository.
- Restrict production origins in `api/chat.js` if the website domain changes.
- Set API usage limits and monitor usage in the OpenAI dashboard before public launch.
