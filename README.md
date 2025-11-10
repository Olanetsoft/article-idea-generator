[![Open in GitPod](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/Olanetsoft/article-idea-generator) [![GitHub issues](https://img.shields.io/github/issues/Olanetsoft/article-idea-generator)](https://github.com/Olanetsoft/article-idea-generator/issues)
[![GitHub forks](https://img.shields.io/github/forks/Olanetsoft/article-idea-generator)](https://img.shields.io/github/forks/Olanetsoft/article-idea-generator)
[![GitHub stars](https://img.shields.io/github/stars/Olanetsoft/article-idea-generator)](https://img.shields.io/github/stars/Olanetsoft/article-idea-generator)
[![GitHub watchers](https://img.shields.io/github/watchers/Olanetsoft/article-idea-generator?style=label=Watch)](https://github.com/Olanetsoft/article-idea-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![GitHub repo size](https://img.shields.io/github/repo-size/Olanetsoft/article-idea-generator)](https://github.com/Olanetsoft/article-idea-generator)

## [Article Idea Generator](https://www.articleideagenerator.com/)

Generate engaging article ideas instantly using AI. This tool helps content creators, bloggers, and writers overcome writer's block by generating creative, SEO-friendly article titles based on any topic.

### ✨ Features

- **AI-Powered Generation**: Uses OpenAI's GPT-4o-mini for intelligent article idea creation
- **SEO Optimization**: Toggle SEO & Clickbait mode for search engine-friendly titles
- **Character Count**: Real-time character count with SEO optimization indicators (50-60 chars ideal)
- **Abstract Generation**: Generate detailed abstracts for any title with natural, human-like writing
- **Recent Searches**: Quick access to your last 5 searches for easy reuse
- **Social Sharing**: Share generated ideas directly to Twitter or LinkedIn
- **Dark Mode**: Comfortable viewing in any lighting condition
- **Mobile Responsive**: Optimized for all devices
- **Accessibility**: Full keyboard navigation and ARIA labels

[![Article Idea Generator - I](https://github.com/Olanetsoft/article-idea-generator/assets/45847909/d193b273-e38f-43a9-88ee-2faddb21ea5b)](https://www.articleideagenerator.com/)
[![Article Idea Generator - II](https://github.com/Olanetsoft/article-idea-generator/assets/45847909/cc7c64c0-e623-4026-9155-7e104ec67d61)](https://www.articleideagenerator.com/)

## How to use

1. Visit [https://www.articleideagenerator.com/](https://www.articleideagenerator.com/)
2. Enter a topic or keyword related to your article idea
3. **Optional**: Enable the "SEO & Clickbait feature" for search engine-optimized titles
4. Click the search button or press Enter to generate 4 unique article ideas
5. Review the character count (green = SEO optimal, 50-60 characters)
6. Click any title to copy it to your clipboard
7. Use the share button to post ideas on Twitter or LinkedIn
8. Click the document icon to generate a detailed abstract for any title
9. Access recent searches for quick topic reuse
10. Paste your chosen title into your content editor and start writing!

### 💡 Tips

- Use specific keywords for better results
- Enable SEO mode for titles optimized for search engines
- Aim for titles with 50-60 characters for best SEO performance
- Generate abstracts to jumpstart your article outline
- Save time by revisiting recent searches

## How it works

This application uses the [OpenAI GPT-4o-mini API](https://openai.com/api/) to generate intelligent, creative article ideas. When you enter a topic:

1. The app creates a specialized prompt based on your input and SEO settings
2. The prompt is sent to GPT-4o-mini (temperature: 0.7, max tokens: 800)
3. The AI generates 4 unique, engaging article titles
4. For abstracts, a specialized anti-AI prompt ensures natural, human-like writing
5. Results are displayed with character count and sharing options

### 🛠️ Tech Stack

- **Framework**: Next.js 13.1.5 with TypeScript
- **AI**: OpenAI GPT-4o-mini API
- **Styling**: TailwindCSS with dark mode
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **State**: React hooks + localStorage
- **Deployment**: Vercel

## Running Project Locally

### Prerequisites

- Node.js 14.x or higher
- npm or yarn
- OpenAI API key

### Setup Instructions

1. **Fork and Clone**

   ```bash
   git clone https://github.com/YOUR_USERNAME/article-idea-generator.git
   cd article-idea-generator
   ```

2. **Get Your OpenAI API Key**

   - Go to [OpenAI](https://platform.openai.com/account/api-keys)
   - Create an account or sign in
   - Click "Create new secret key"
   - Copy the generated API key

3. **Configure Environment Variables**

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and add your API key:

   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. **Install Dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

5. **Start Development Server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

See `.env.example` for required configuration:

- `OPENAI_API_KEY`: Your OpenAI API key (required)
  - Get it from: https://platform.openai.com/account/api-keys
  - Used for: GPT-4o-mini API calls
  - Cost: Pay-per-use (see OpenAI pricing)

## Contributing

If you want to contribute to this project, please read the [contributing guide](./CONTRIBUTING.md). If you have any ideas or suggestions, feel free to open an issue or a pull request.

If you like this project, please give it a star ⭐️

## Contributors 💪

Thanks for spending your time helping `Article Idea Generator` grow. Happy Hacking 🍻

[![Contributors](https://contrib.rocks/image?repo=Olanetsoft/article-idea-generator)](https://github.com/Olanetsoft/article-idea-generator/edit/main/README.md)

## Stargazers ⭐️

[![Stargazers](https://git-lister.onrender.com/api/stars/Olanetsoft/article-idea-generator?limit=15)](https://github.com/Olanetsoft/article-idea-generator)

## Acknowledgement

Built with 💗 Inspired by [Nutlope](https://twitter.com/nutlope), powered by [Open AI](https://openai.com/).
