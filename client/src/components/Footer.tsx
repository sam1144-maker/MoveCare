export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-4">MoveCare</h2>
          <p className="text-sm text-slate-400">AI-Powered Remote Physiotherapy.<br/>Bridging the gap between recovery and expert care.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-primary-400 transition-colors">About Us</a></li>
            <li><a href="#how-it-works" className="hover:text-primary-400 transition-colors">How It Works</a></li>
            <li><a href="#testimonials" className="hover:text-primary-400 transition-colors">Reviews</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
          <ul className="space-y-2 text-sm">
            <li>support@movecare.example.com</li>
            <li>+1 (555) 123-4567</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-sm text-center text-slate-500">
        &copy; {new Date().getFullYear()} MoveCare. All rights reserved.
      </div>
    </footer>
  );
}
