import pool from "./database.js";

const API_KEY = process.env.TICKETMASTER_API_KEY;

export async function getAttractionId(artist_name) {
  const url = `https://app.ticketmaster.com/discovery/v2/attractions.json?keyword=${encodeURIComponent(artist_name)}&apikey=${API_KEY}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      `Ticketmaster request failed with status ${response.status}`,
    );
  }

  const json = await response.json();
  return json?._embedded?.attractions?.[0]?.id ?? null;
}

export async function getVenue(venue_id) {
  const url = `https://app.ticketmaster.com/discovery/v2/venues/${encodeURIComponent(venue_id)}.json?apikey=${API_KEY}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      `Ticketmaster request failed with status ${response.status}`,
    );
  }

  const json = await response.json();
  return json?.name ?? null;
}

export async function getConcerts(attraction_id) {
  const url = `https://app.ticketmaster.com/discovery/v2/events.json?attractionId=${encodeURIComponent(attraction_id)}&includeTBA=no&includeTBD=no&sort=date,asc&apikey=${API_KEY}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      `Ticketmaster request failed with status ${response.status}`,
    );
  }

  const json = await response.json();
  return json?._embedded?.events ?? null;
}

export async function syncArtistConcerts() {
  const { rows } = await pool.query(`SELECT id, name FROM artists ORDER BY id`);
  const todayDate = new Date();

  for (const artist of rows) {
    try {
      const attractionId = await getAttractionId(artist.name);
      // console.log(attractionId)
      let prevConcert = null;
      if (attractionId != null) {
        const concerts = await getConcerts(attractionId);
        for (const concert of concerts) {
          const eventName =  concert.name;
          const venueInfo = concert._embedded.venues[0];
          let venueName = await getVenue(venueInfo.id);
          const city = venueInfo.city.name;
          const date = concert.dates.start.dateTime;
          const ticketLink = concert.url;

          if (venueName.includes("Ziggo Dome")) venueName = "Ziggo Dome";

          const concertDateObj = new Date(date)
          if ((concertDateObj >= todayDate && !eventName.toLowerCase().includes("fast track"))) {
            await pool.query(
              `INSERT INTO concerts (artist_id, concert_name, venue, city, date, ticket_link, source)
                VALUES ($1, $2, $3, $4, $5, $6, 'api')
                RETURNING *
              `,
              [artist.id, eventName, venueName, city, date, ticketLink],
          )
          }
        }
      }
    } catch (err) {
      console.error(`Failed to find concerts for ${artist.name}:`, err);
    }
  }
}
