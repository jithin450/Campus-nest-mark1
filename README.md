# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/92b1f7d5-4ef0-4661-bc0c-51f52c10db1f

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/92b1f7d5-4ef0-4661-bc0c-51f52c10db1f) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Location selector and filtering

- A header dropdown lets you choose `Rajampeta` or `Bengaluru`.
- Selection is persisted in `localStorage` and shared via a React context.
- Hostels, Restaurants, Places, and Community pages filter content by the selected location.

### Supabase seeding

- Apply SQL in `supabase/migrations/20251205_create_cards.sql` to create `cards` and seed Bengaluru samples.
- Run: `psql < supabase/migrations/20251205_create_cards.sql` or use Supabase SQL editor.

### Development and tests

- Start: `npm run dev`
- Unit tests: `npm test`
- E2E smoke: `npm run e2e-smoke`

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/92b1f7d5-4ef0-4661-bc0c-51f52c10db1f) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
