# 🖼️ Crypto Shelf

Crypto Shelf is a stylish 2x4 digital cabinet for showcasing your crypto identity. Collect accessories, customize your shelf with themes, and share your unique layout with the world.

## ✨ Features

- **2x4 Identity Grid**: curate your top 8 items from various categories (Crypto, Memes, Toys).
- **Custom Themes**: Choose between premium gradients and full-image backgrounds with matching cabinet frames.
- **Social Interaction**: React to other users' shelves and climb the daily/weekly leaderboard.
- **Admin Panel**: Manage the entire ecosystem (Themes & Accessories) from a professional dashboard.
- **Mobile First**: Fully responsive design optimized for mobile shelf building and browsing.

## 🚀 Deployment to Vercel

The easiest way to deploy Crypto Shelf is via the [Vercel Dashboard](https://vercel.com/new).

### Manual Deployment Steps:

1.  **Initialize Git** (Already completed):
    ```bash
    git init -b main
    git add .
    git commit -m "initial commit"
    ```
2.  **Push to GitHub**:
    - Create a new repository on GitHub.
    - Run: `git remote add origin YOUR_REPO_URL`
    - Run: `git push -u origin main`
3.  **Import to Vercel**:
    - Connect your GitHub account to Vercel.
    - Select the `crypto-shelf` repository.
    - **Framework Preset**: Vite (detected automatically).
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
4.  **Click Deploy**.

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## 🎨 Tech Stack

- **Framework**: React 19 + Vite 7
- **Routing**: React Router 7
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State**: Custom Context-based Store with LocalStorage persistence
- **Styling**: Vanilla CSS with modern variables and glassmorphism.
