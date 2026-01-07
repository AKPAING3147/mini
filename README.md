# 🌸 Period Cycle Tracker (Telegram Mini App)

A feminine, privacy-focused cycle tracker that runs inside Telegram. Features automatic partner notifications for period start + food cravings.

## Features
- **Cycle Tracking**: Predicts next period and tracks delay.
- **Partner Notifications**: Auto-sends a message to your boyfriend when you click "Period Started".
- **Food Cravings**: Customize your favorite comfort foods to include in the notification.
- **Privacy**: Data stored securely, explicit consent for notifications.

## Setup

1. **Database**:
   Update `.env` with your database URL (Postgres/Neon recommended, comes with SQLite for dev).
   ```bash
   DATABASE_URL="file:./dev.db" # Or postgresql://...
   ```

2. **Telegram Bot Token**:
   Add your bot token to `.env` to enable partner notifications.
   ```bash
   BOT_TOKEN="123456:ABC-..."
   ```

3. **Install & Run**:
   ```bash
   npm install
   npx prisma db push
   npm run dev
   ```

4. **Telegram Integration**:
   See [TELEGRAM_SETUP.md](./TELEGRAM_SETUP.md).

## Project Structure
- `app/components/*`: Main UI components (Home, Partner, Foods).
- `app/api/*`: Backend logic for syncing users, tracking cycles, and settings.
- `lib/telegram.ts`: Helper to send messages via Bot API.
- `prisma/schema.prisma`: Database schema.

## Partner Setup
1. User enables "Partner Notifications" in the app.
2. User enters Partner's Telegram ID (Partner must have started the bot).
3. When "Period Started Today" is clicked, the bot sends the custom message + food list.
