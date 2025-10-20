import { useParams, Link } from "react-router-dom";

export default function VenueDetails() {
  const { id } = useParams();

  return (
    <main style={{ padding: 24 }}>
      <h1>Venue Details</h1>
      <p>Venue ID: <strong>{id}</strong></p>

      <section style={{ marginTop: 16 }}>
        <p>This is a stub venue details page. Add photos, description, and a “Check in” button here.</p>
      </section>

      <div style={{ marginTop: 24 }}>
        <Link to="/venues" style={{ textDecoration: "underline" }}>← Back to Venues</Link>
      </div>
    </main>
  );
}
