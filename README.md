# Sona

CodePath WEB103 Final Project

Designed and developed by:

- Chau Cao
- Abdul Khan
- Dev Goswami
- Gustave Ntwali
- Carolina Herrera
- Armin Erika Polanco

🔗 Link to deployed app:

## About

### Description and Purpose

**Sona** is a full-stack web app where users can browse artist profiles, follow their favorite artists, view upcoming concert dates, and shop artist merch all in one place.

Music fans often have to juggle multiple platforms to keep up with an artist. From social media for updates, ticketing sites for shows, separate stores for merch. **Sona** exists to bring that experience together in one app, making it easier for fans to stay connected and for artists to reach their community directly.

### Inspiration

This project builds on ideas from several of our previous coursework projects. Multiple members of our group have worked on music-themed projects earlier in the course that explored artist/music reference content, vinyl and merch customization, and community-oriented spaces. **Sona** brings these ideas together into a single hub where fans can follow artists, engage with a community built around music, and shop artist merch. Furthermore, we take inspiration from existing platforms, such as Ticketmaster and Bandcamp, to build from.

## Tech Stack

- Frontend: React (Vite), React Router
- Backend: Express, Node.js, PostgreSQL
- Auth: Passport.js, GitHub OAuth
- Image Storage: Cloudinary

## Features

### ✅ Artist Directory

- Browse all artists with genre, bio, and profile image. Search bar w/ Filter by genre.

- ![Artist Directory](https://i.imgur.com/aYOxXjl.gif)

### ✅ Follow Artists

- Users can follow/unfollow artists to build a personalized list of who they're keeping up with, with an optional "notify me" toggle.

- ![Follow Artists](https://i.imgur.com/foZSTEV.gif)

### ✅ Artist Posts

- Artist can post updates like new merch drops, show announcements, news, etc. that are visible to their followers, directly on their artist page.

- ![Artist Posts](https://i.imgur.com/Vj749I2.gif)

### ✅ Artist Quick-View Panel

- Slide-out modal showing artist details and discography without navigating away from the current page.

- ![Artist Quick-View Panel](https://i.imgur.com/8dW0ZTp.gif)

### ✅ Merch Shop with Filtering

- Browse merch (vinyl, CD, apparel) filtered by artist, genre, or format, with sort by price.

- ![Merch Shop with Filtering](https://i.imgur.com/D9E3GfE.gif)

### ✅ Merch Management (Artist side)

- Artist can create, edit, and delete their own merch directly from their artist page.

- ![Merch Management](https://i.imgur.com/CuBTE98.gif)

### ✅ Order System

- Add merch to a cart, adjust quantities (capped at available stock), and place an order. View full order history.

- ![Order System](https://i.imgur.com/vB2nDox.gif)

### ✅ Concert Listings

- View upcoming shows per artist and on a dedicated Concerts page, filterable by city and searchable by artist. Combines real event data from the Ticketmaster API with artist-added shows.

- ![Concert Listings](https://i.imgur.com/g2ObiiO.gif)

- ![Concerts From Artist Page](https://i.imgur.com/1hTvFkR.gif)

### ✅ Following Feed

- A personalized feed combining posts, upcoming shows, and merch drops from every artist a fan follows, sorted by most recent.

- ![Following Feed](https://i.imgur.com/fGuayo0.gif)

### ✅ GitHub OAuth Login

- Users sign in with their real GitHub account, replacing the placeholder login used in earlier milestones. Every backend route now verifies the logged-in session rather than trusting client-provided data.

- ![GitHub OAuth Login](https://i.imgur.com/wSikzYQ.gif)

### ✅ Fan / Artist Onboarding

- New users choose to join as a Fan or an Artist. Choosing Artist creates a new artist page, profile, and admin ownership link all at once, and the user is taken directly to their new artist page.

- ![Artist Onboarding](https://i.imgur.com/Heg6odU.gif)

### ✅ Cloud Image Upload

- Users can upload real image files (instead of pasting a URL) when creating or editing merch, powered by Cloudinary.

- ![Cloud Image Upload](https://i.imgur.com/yeb6qKU.gif)

### (Stretch) Spotify Connect

- Link a Spotify account to import playlists and generate personalized recommendations.

- ![gif goes here]()

### (Stretch) Sona Mix

- Auto-generate a custom playlist from the artists you follow, featured right on your profile.

- ![gif goes here]()

### (Stretch) Real Payment Integration

- Real checkout system built on top of the existing order system.

- ![gif goes here]()

## Installation Instructions

[instructions go here]
