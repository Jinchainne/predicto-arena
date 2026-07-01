import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type GeoResult = {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};

const locationAliases: Record<string, string> = {
  France: "Paris",
  Argentina: "Buenos Aires",
  Brazil: "Rio de Janeiro",
  England: "London",
  "United States": "New York",
  USA: "New York",
  Canada: "Toronto",
  Mexico: "Mexico City",
  Bitcoin: "New York",
  Ethereum: "New York",
  BNB: "Singapore",
  Solana: "San Francisco"
};

function normalizeLocation(value: string) {
  const clean = value.replace(/[^a-zA-Z\s]/g, " ").replace(/\s+/g, " ").trim();
  return locationAliases[clean] ?? clean;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = normalizeLocation(searchParams.get("location") || "New York");

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
    const geoResponse = await fetch(geoUrl, { next: { revalidate: 3600 } });
    if (!geoResponse.ok) throw new Error(`Geocoding HTTP ${geoResponse.status}`);
    const geoPayload = await geoResponse.json();
    const place = geoPayload?.results?.[0] as GeoResult | undefined;
    if (!place) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`;
    const weatherResponse = await fetch(weatherUrl, { next: { revalidate: 900 } });
    if (!weatherResponse.ok) throw new Error(`Weather HTTP ${weatherResponse.status}`);
    const weather = await weatherResponse.json();

    return NextResponse.json({
      location: `${place.name}${place.country ? `, ${place.country}` : ""}`,
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: weather.timezone ?? place.timezone ?? "auto",
      current: weather.current,
      units: weather.current_units,
      source: "Open-Meteo"
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Weather request failed" },
      { status: 500 }
    );
  }
}
