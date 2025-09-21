import './index.css';

export default function Landing() {
  return (
    <div className="bg-red-500 text-white text-3xl p-10">
      If this is red, Tailwind is working!
    </div>
  );
}

module.exports = {
  content: [
    "./client/src/**/*.{js,jsx,ts,tsx}",
    "./client/public/index.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}