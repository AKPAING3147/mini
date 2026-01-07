# How to Setup in Telegram

## Prerequisite: Public URL
Telegram requires your app to be served over **HTTPS** on a public URL. You cannot use `localhost` directly.

### Option A: Local Development (Tunneling)
Use a tool like `ngrok` or `cloudflared` to expose your local `npm run dev` server. This is best for testing while you code.
1. Start your app: `npm run dev`
2. In a new terminal, use a tunnel tool. For example, if using ngrok:
   ```bash
   ngrok http 3000
   ```
3. Copy the secure HTTPS URL (e.g., `https://xxxx-xxxx.ngrok-free.app`).

### Option B: Production (Vercel)
Deploy your repository to Vercel (recommended for Next.js).
1. Push your code to GitHub/GitLab.
2. Import the project in Vercel.
3. Add your Environment Variables (`DATABASE_URL`).
4. Copy the final deployment domain (e.g., `https://your-app.vercel.app`).

---

## Step 1: Create a Bot
1. Open Telegram and search for **[@BotFather](https://t.me/BotFather)**.
2. Send `/newbot`.
3. Follow the prompts to name your bot and give it a username (must end in `bot`).
4. You will get an API Token.

## Step 2: Configure the Mini App
You can add the app to your bot in a few ways.

### Method 1: Menu Button (Recommended)
This adds an "Open App" button to the bottom left of the chat with your bot.
1. In @BotFather, send `/mybots`.
2. Select your bot.
3. Select **Bot Settings** > **Menu Button**.
4. Select **Configure Menu Button**.
5. Send the **HTTPS URL** from the Prerequisite step.
6. Enter a title (e.g., "My Tasks").

### Method 2: Direct Link (Game/Web App)
1. In @BotFather, send `/newapp`.
2. Select your bot.
3. Follow the prompts (Title, Description, Image).
4. Send the **HTTPS URL**.
5. You will get a link like `t.me/yourbot/appname`.

## Step 3: Test
1. Open your bot in Telegram.
2. Click the **Menu Button** or the link you created.
3. Your app should slide up as a Web App!

## Debugging
- If you see a blank white screen, ensure your URL starts with `https://`.
- If you see "Window is not defined" logs in Vercel, ensure you kept the `ssr: false` setting in `page.tsx` (this project is already configured for this).
- If database actions fail, check your Cloud/Vercel Environment Variables.
