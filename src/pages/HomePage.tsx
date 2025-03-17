import { Link } from "react-router-dom"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto py-20 px-4 flex-grow">
        <h1 
          className="font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
          style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 5rem)',
            lineHeight: '1.2'
          }}
        >
          Mia's Useful Tools
        </h1>
        
        <p className="text-xl text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
          A collection of helpful tools and utilities designed to make your life easier.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Link to="/timeline" className="group">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/10">
              <h2 className="text-2xl font-semibold mb-3 group-hover:text-primary">Timeline Task Manager</h2>
              <p className="text-muted-foreground mb-4">
                Organize your tasks around key events and deadlines with a visual timeline interface.
              </p>
              <div className="flex justify-end">
                <span className="text-primary text-sm font-medium group-hover:underline">
                  Open →
                </span>
              </div>
            </div>
          </Link>

          <Link to="/geiger-counter" className="group">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/10">
              <h2 className="text-2xl font-semibold mb-3 group-hover:text-primary">Geiger Counter Simulator</h2>
              <p className="text-muted-foreground mb-4">
                Simulate radiation detection with customizable sound and event rate settings.
              </p>
              <div className="flex justify-end">
                <span className="text-primary text-sm font-medium group-hover:underline">
                  Open →
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
      
      <footer className="py-4 text-center text-sm text-muted-foreground mt-auto">
        <p>2025 Mia Lemoine. All rights reserved</p>
      </footer>
    </div>
  )
} 