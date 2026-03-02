
function AboutPage() {
  return (
    <div>
      <div className="about-hero">
        <h1>About Bengal Creations</h1>
        <p style={{ color: "rgba(245,228,184,0.8)", fontSize: 18, fontStyle: "italic" }}>Celebrating West Bengal's Rich Artisanal Heritage</p>
      </div>
      <div className="about-content">
        {[["Our Mission","Bengal Creations is a premium digital marketplace dedicated to preserving and promoting the rich craft traditions of West Bengal. We connect skilled artisans directly with customers who appreciate authentic, handcrafted excellence."],["Our Story","Founded by a passionate team from Kolkata, Bengal Creations was born from a desire to bring the incredible handicrafts of Bengal — from Bishnupur terracotta to Murshidabad silk — to a global audience while ensuring fair compensation for artisans."],["The Artisans","We work with over 500 verified artisans across all 23 districts of West Bengal. Each vendor is carefully vetted to ensure authenticity, quality, and ethical production practices."]].map(([title, text]) => (
          <div key={title} style={{ marginBottom: 32, background: "white", borderRadius: 16, padding: 32, border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
            <h3 style={{ color: "var(--maroon)", fontSize: 22, marginBottom: 12 }}>{title}</h3>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
export default AboutPage;