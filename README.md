# 🎬 Cine-Scope

Cine-Scope is a responsive, frontend-only movie explorer app that lets users search, explore, rate, and bookmark movies using the TMDB API.

---

## 🌟 Features

- 🔍 Real-time search with autocomplete
- 📊 Browse popular, trending, and top-rated movies
- 🎛️ Discover movies with filters (genre, year, sort)
- 🧾 Add/remove movies from personal watchlist
- ⭐ Rate movies and view rated list
- 📱 Fully responsive (mobile + desktop)
- 🧠 Built with clean, modular JavaScript

---

## 🚀 Tech Stack

- **HTML5**
- **Tailwind CSS**
- **Vanilla JavaScript**
- **[TMDB API](https://developers.themoviedb.org/3)**

---

## 🖼️ Screenshots

> Coming soon — add UI preview once hosted.

---

## 📦 Installation

1. Clone the repo:

```bash
git clone https://github.com/QuantumCoderrr/Cine-Scope.git
cd Cine-Scope
```

2. Just open the index.html file in your browser — no backend needed!

## 🌐 Live Demo

🚧 Not deployed yet — will update after GitHub Pages or Vercel deployment.

## 🧠 How It Works

Cine-Scope uses the [TMDB API](https://developers.themoviedb.org/3) to fetch movie data. Here’s how major features work:

- **Search:** Debounced input field with TMDB’s search endpoint
- **Home Page:** Fetches `popular` and `top_rated` movies
- **Trending Page:** Uses `/trending/movie/week`
- **Discover Page:** Uses `/discover/movie` with filters (genre, year, sort)
- **Watchlist:** Stored in `localStorage` per user
- **Ratings:** Users rate movies from 1–5 stars; stored in `localStorage`
- **Auth:** Basic client-side signup/login using `localStorage`

---
## 🔐 LocalStorage Keys Used

| Key             | Purpose                              |
|------------------|--------------------------------------|
| `users`          | Array of all registered users        |
| `currentUser`    | Logged-in user data                  |
| `watchlist`      | Watchlist per user (stored in user)  |
| `ratings`        | Movie ratings per user (stored in user) |

---

## 🙋 FAQ

**Q: Do I need a backend?**  
A: Nope. Everything runs in-browser using `localStorage`.

**Q: Can I use this in my portfolio?**  
A: Hell yes. Just credit it or fork it and make it yours.

**Q: Does it support dark mode?**  
A: It's already in full dark mode, because light mode is for the weak 😎

---

## 🛠️ To-Do / Future Improvements

- ✅ Star rating UX with hover effect
- 🔲 OAuth login (Google/GitHub)
- 🔲 Movie trailers & YouTube embeds
- 🔲 Save data to Firebase or Supabase instead of localStorage
- 🔲 Progressive Web App (PWA) support

---

## 🤝 Contributing

Pull requests are welcome! If you want to improve Cine-Scope or add features, feel free to fork and PR.

---

## 🧑‍💻 Author

**Sandip Ghosh**  
👨‍🎓 B.Tech AI & ML Student  
💼 [LinkedIn](https://www.linkedin.com/in/sandip-ghosh-b782662a5/)  
💻 [GitHub](https://github.com/QuantumCoderrr)  
📧 sandipghosh0801@gmail.com

---

## 🧾 License

This project is licensed under the MIT License — do whatever you want, just give credit.


