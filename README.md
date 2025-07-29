# Gym Training Log

A modern Next.js application to track your gym workouts by muscle groups. Built with TypeScript, Tailwind CSS, and local storage for data persistence.

## Features

- 📅 **Date-based logging** - Track workouts for any date
- 💪 **Muscle group selection** - Choose from Back/Biceps/Shoulders, Chest/Triceps, or Legs
- 📱 **Mobile responsive** - Works great on all devices
- 💾 **Local storage** - Your data stays private in your browser
- 🎨 **Modern UI** - Clean design with Tailwind CSS
- ⚡ **Fast performance** - Built with Next.js 15 and App Router

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - Modern state management
- **Local Storage** - Client-side data persistence

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/gympoint-nextjs.git
cd gympoint-nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Vercel will automatically detect Next.js and deploy
5. Your app will be live at a free `.vercel.app` URL

### Other Deployment Options

This Next.js app can be deployed to any platform that supports Node.js:
- Netlify
- Railway
- Render
- AWS
- Google Cloud Platform

## Usage

1. **Select a date** - Use the date picker or keep today's date
2. **Choose muscle groups** - Click on the workout type for that day
3. **Save** - Click "Save Workout" to store your selection
4. **View history** - See all your past workouts in the history section

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
└── components/
    └── GymLogApp.tsx       # Main application component
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ using Next.js and TypeScript
