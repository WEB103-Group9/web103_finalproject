import pool from "./database.js";
import { syncArtistConcerts } from "./ticketmaster.js";

const dropTables = `
  DROP TABLE IF EXISTS order_items CASCADE;
  DROP TABLE IF EXISTS orders CASCADE;
  DROP TABLE IF EXISTS concerts CASCADE;
  DROP TABLE IF EXISTS posts CASCADE;
  DROP TABLE IF EXISTS follows CASCADE;
  DROP TABLE IF EXISTS merch CASCADE;
  DROP TABLE IF EXISTS admin CASCADE;
  DROP TABLE IF EXISTS profile CASCADE;
  DROP TABLE IF EXISTS artists CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
`;

const createTables = `
  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'fan',
    photo VARCHAR(255),
    github_id VARCHAR(50) UNIQUE,
    spotify_access_token TEXT,
    spotify_refresh_token TEXT,
    spotify_token_expires_at TIMESTAMP,
    spotify_playlist_id VARCHAR(100),
    avatar_url VARCHAR(255),
    onboarded BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE artists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    genre VARCHAR(50),
    photo VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE merch (
    id SERIAL PRIMARY KEY,
    artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    photo VARCHAR(255),
    stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- one-to-one: artists <-> profile
  CREATE TABLE profile (
    artist_id INTEGER UNIQUE REFERENCES artists(id) ON DELETE CASCADE,
    description TEXT,
    instagram VARCHAR(100),
    twitter VARCHAR(100),
    facebook VARCHAR(100),
    tiktok VARCHAR(100),
    spotify VARCHAR(255)
  );

  -- one-to-one: users <-> artists, via admin
  CREATE TABLE admin (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    artist_id INTEGER UNIQUE REFERENCES artists(id) ON DELETE CASCADE
  );

  -- many-to-many join table: users <-> artists
  CREATE TABLE follows (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    artist_id INTEGER REFERENCES artists(id) ON DELETE CASCADE,
    notify_on_release BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, artist_id)
  );

  CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    artist_id INTEGER REFERENCES artists(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    merch_id INTEGER NOT NULL REFERENCES merch(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0)
  );


  CREATE TABLE concerts (
    id SERIAL PRIMARY KEY,
    artist_id INTEGER REFERENCES artists(id) ON DELETE CASCADE,
    concert_name VARCHAR(80),
    venue VARCHAR(150),
    city VARCHAR(50),
    date DATE NOT NULL,
    ticket_link VARCHAR(2083) NOT NULL,
    source VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
  );
`;

async function seed() {
  const client = await pool.connect();
  try {
    console.log("Dropping existing tables...");
    await client.query(dropTables);

    console.log("Creating tables...");
    await client.query(createTables);

    console.log("Seeding users...");
    const users = await client.query(`
      INSERT INTO users (username, role) VALUES
        ('testfan', 'fan'),
        ('testadmin', 'artist')
      RETURNING id, username, role;
    `);
    const [fan, testAdmin] = users.rows;

    console.log("Seeding artists...");
    const artists = await client.query(`
      INSERT INTO artists (name, genre, photo) VALUES
          ('Melanie Martinez', 'Pop', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ55NdqWPtfsR4tXLpBbuY4sPjrw7rJRPhjO-3atR0lOSglv1lZRdquYi-5anDdVUv0Sl06F9GnjxW9hpC1ygkQnZiSyQfB3wGtV5lEfs9E&s=10'),
          ('Kali Uchis', 'Alternative R&B', 'https://www.papermag.com/media-library/image.jpg?id=60169465'),
          ('Holywatr', 'Alternative Metal', 'https://www.blackcatdc.com/images/460/holywatr.jpg'),
          ('Joji', 'Alternative R&B', 'https://pchcorral.com/wp-content/uploads/2018/09/1280x1280-900x900.jpg'),
          ('BINI', 'P-Pop', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRi6n-UeooyveWEQlouFVXZW099t_WGK8TBGGPi1Mnk5NOSO2M3iosmtvg&s=10'),
          ('SB19', 'P-Pop', 'https://imageio.forbes.com/specials-images/imageserve/6a6d07716da8cd992d573f76/SB19-poses-backstage-following-a-historic-performance-on-day-one-at-Lollapalooza-/960x0.jpg'),
          ('Don Toliver', 'Hip-Hop', 'https://m.media-amazon.com/images/I/714HSJN-ubL._UF1000,1000_QL80_.jpg')
      RETURNING id, name;
    `);
    const [artist1, artist2, artist3, artist4, artist5, artist6, artist7] =
      artists.rows;

    console.log("Seeding merch...");
    await client.query(
      `INSERT INTO merch (artist_id, name, type, price, photo, stock) VALUES
    ($1, 'Tour T-Shirt', 'apparel', 25.00, 'https://picsum.photos/seed/merch1/400/400', 50),
    ($1, 'Vinyl Record', 'music', 30.00, 'https://picsum.photos/seed/merch2/400/400', 20),
    ($2, 'Hoodie', 'apparel', 45.00, 'https://picsum.photos/seed/merch3/400/400', 30),
    ($2, 'Poster', 'accessory', 15.00, 'https://picsum.photos/seed/merch4/400/400', 100),
    ($3, 'Snapback Hat', 'apparel', 28.00, 'https://picsum.photos/seed/merch5/400/400', 40),
    ($4, 'Band Tee', 'apparel', 35.00, 'https://picsum.photos/seed/merch6/400/400', 25),
    ($5, 'Concert Lanyard', 'accessory', 50.00, 'https://picsum.photos/seed/merch7/400/400', 10),
    ($6, 'Light Stick', 'accessory', 60.00, 'https://picsum.photos/seed/merch8/400/400', 10),
    ($7, 'Signed Vinyl Record', 'accessory', 50.00, 'https://picsum.photos/seed/merch9/400/400', 10)
  `,
      [
        artist1.id,
        artist2.id,
        artist3.id,
        artist4.id,
        artist5.id,
        artist6.id,
        artist7.id,
      ],
    );

    console.log("Seeding profiles...");
    await client.query(
      `INSERT INTO profile (artist_id, description, instagram, twitter, facebook, tiktok, spotify) VALUES
  ($1, 'Singer, songwriter, and visual artist known for cinematic, theatrical pop.', '@melaniemartinez', '@littlebodybigheart', '@melaniemartinez', '@melaniemartinez', 'https://open.spotify.com/artist/63yrD80RY3RNEM2YDpUpO8'),
  ($2, 'Colombian-American singer blending R&B, reggaeton, and dream pop.', '@kaliuchis', '@kaliuchis', '@kaliuchis', '@kaliuchis', 'https://open.spotify.com/artist/1U1el3k54VvEUzo3ybLPlM'),
  ($3, 'Alternative metal outfit known for a gritty, genre-blurring sound.', '@holywatr', '@holywatr', '@holywatr', '@holywatr', 'https://open.spotify.com/artist/0muUUrVzG2eMabJN2UHtZB'),
  ($4, 'Japanese-Australian singer, songwriter, record producer, and former internet personality.', '@sushitrash', '@joji', '@joji', '@joji', 'https://open.spotify.com/artist/3MZsBdqDrRTJihTHQrO6Dq'),
  ($5, 'P-Pop girl group known for high-energy performances.', '@bini_ph', '@bini_ph', '@bini_ph', '@bini_ph', 'https://open.spotify.com/artist/7tNO3vJC9zlHy2IJOx34ga'),
  ($6, 'P-Pop boy group blending dance-pop and hip-hop influences.', '@sb19official', '@SB19Official', '@SB19Official', '@sb19official', 'https://open.spotify.com/artist/3g7vYcdDXnqnDKYFwqXBJP'),
  ($7, 'Houston-born artist known for melodic trap and R&B-infused hip-hop.', '@dontoliver', '@dontoliver', '@dontoliver', '@dontoliver', 'https://open.spotify.com/artist/4Gso3d4CscCijv0lmajZWs')
      `,
      [
        artist1.id,
        artist2.id,
        artist3.id,
        artist4.id,
        artist5.id,
        artist6.id,
        artist7.id,
      ],
    );

    console.log("Seeding admin link...");
    await client.query(
      `INSERT INTO admin (user_id, artist_id) VALUES ($1, $2)`,
      [testAdmin.id, artist1.id],
    );

    console.log("Seeding follows...");
    await client.query(
      `INSERT INTO follows (user_id, artist_id) VALUES ($1, $2), ($1, $3), ($1, $4)`,
      [fan.id, artist1.id, artist3.id, artist5.id],
    );

    console.log("Seeding posts...");
    await client.query(
      `INSERT INTO posts (artist_id, content) VALUES
        ($1, 'Follow me for updates on my upcoming tour and new music releases!'),
        ($2, 'Follow me for updates on my upcoming tour and new music releases!'),
        ($3, 'Follow me for updates on my upcoming tour and new music releases!'),
        ($4, 'Follow me for updates on my upcoming tour and new music releases!'),
        ($5, 'Follow me for updates on my upcoming tour and new music releases!'),
        ($6, 'Follow me for updates on my upcoming tour and new music releases!'),
        ($7, 'Follow me for updates on my upcoming tour and new music releases!')
      `,
      [
        artist1.id,
        artist2.id,
        artist3.id,
        artist4.id,
        artist5.id,
        artist6.id,
        artist7.id,
      ],
    );

    console.log("Seeding Ticketmaster Discovery API concerts...");
    await syncArtistConcerts();

    {
      /* Using ticketmaster api to seed concerts
    console.log("Seeding concerts manually");
    await client.query(
      `INSERT INTO concerts (artist_id, venue, city, date, ticket_link, source) VALUES
        ($1, 'CFG Arena', 'Baltimore', '2026-08-01', 'www.example.com', 'manual'),
        ($1, 'Capital One Area', 'Washington, D.C.', '2026-07-28', 'www.example.com', 'manual'),
        ($2, 'Capital One Area', 'Washington, D.C.', '2026-06-30', 'www.example.com', 'manual'),
        ($3, 'The Anthem', 'Washington, D.C.', '2026-06-12', 'www.example.com', 'manual')
      `,
      [artist1.id, artist2.id, artist3.id],
    );
    */
    }

    console.log("✅ Database reset and seeded successfully.");
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
