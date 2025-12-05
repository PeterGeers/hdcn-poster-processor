import React from 'react';

// --- DUMMY DATA VOOR HET VOORBEELD ---
// In het echt komt dit uit je Contentful CMS of Google Calendar API
const dummyEvent = {
  id: 1,
  title: "Super Rally 2025",
  category: 'Internationaal', // Of 'Nationaal', 'Beurzen'
  date: new Date('2025-05-24'),
  location: 'Linköping, Zweden',
  // Een placeholder afbeelding van een motor event.
  // In het echt is dit de URL van de geüploade flyer.
  imageUrl: 'https://images.unsplash.com/photo-1558981403-c546369d50d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
};


// --- DE COMPONENT ---
const HDEventCard = ({ event = dummyEvent }) => {
  // Helper om de datum mooi te formatteren (bijv: "24 MEI")
  const day = event.date.toLocaleDateString('nl-NL', { day: '2-digit' });
  const month = event.date.toLocaleDateString('nl-NL', { month: 'short' }).toUpperCase().replace('.', '');

  // Bepaal kleur op basis van categorie (optioneel)
  const isOrangeCategory = event.category === 'Nationaal';
  const categoryBadgeColor = isOrangeCategory ? '#FF9600' : '#fff';
  const categoryTextColor = isOrangeCategory ? '#000' : '#000';


  return (
    <>
      {/* CSS STYLES (In productie zou je dit in een .css of .module.scss bestand zetten) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Teko:wght@600&display=swap'); /* Een stoer 'Impact-achtig' font */

        .hd-card-wrapper {
           /* Dit simuleert de donkere achtergrond van de website */
           background-color: #1a1a1a;
           padding: 40px;
           display: flex;
           justify-content: center;
        }

        .hd-card {
          background-color: #000000;
          width: 350px; /* Vaste breedte voor dit voorbeeld, in grid gebruik je 100% */
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0,0,0,0.8);
          border: 2px solid #333; /* Subtiele grijze rand standaard */
          transition: all 0.3s ease;
          cursor: pointer;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        /* HET HOVER EFFECT: De 'magie' */
        .hd-card:hover {
          border-color: #FF9600; /* H-D Oranje rand bij hover */
          transform: translateY(-5px); /* Komt iets omhoog */
          box-shadow: 0 8px 20px rgba(255, 150, 0, 0.3); /* Oranje gloed */
        }

        .image-container {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .event-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .hd-card:hover .event-image {
          transform: scale(1.05); /* Foto zoomt iets in bij hover */
        }

        .category-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 10px;
          font-weight: bold;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-radius: 4px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.5);
        }

        .content-block {
          padding: 20px;
          color: #fff;
          position: relative;
        }

        /* De Datum Badge - Kentekenplaat stijl */
        .date-badge {
          position: absolute;
          top: -25px; /* Zorgt dat hij over de foto en tekst heen valt */
          left: 20px;
          background-color: #FF9600;
          color: #000;
          padding: 8px 12px;
          text-align: center;
          border-radius: 4px;
          border: 2px solid #000;
          font-family: 'Teko', sans-serif; /* Stoer font */
          line-height: 1;
        }
        
        .date-day { font-size: 1.8rem; display: block; }
        .date-month { font-size: 1rem; display: block; }

        .event-title {
          margin-top: 25px; /* Ruimte maken voor de datumbadge */
          font-size: 1.4rem;
          text-transform: uppercase;
          font-weight: 800;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          color: #fff;
        }

        .event-location {
          color: #aaa;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }

        /* De 'Call to Action' knop */
        .hd-button {
          width: 100%;
          padding: 10px;
          background-color: transparent;
          border: 2px solid #FF9600;
          color: #FF9600;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .hd-button:hover {
          background-color: #FF9600;
          color: #000;
        }
      `}</style>

      {/* DE COMPONENT RENDER */}
      <div className="hd-card-wrapper">
        <div className="hd-card">
          
          {/* Bovenste helft: Afbeelding en Categorie */}
          <div className="image-container">
            <img src={event.imageUrl} alt={event.title} className="event-image" />
            {/* Categorie label rechtsboven */}
            <div 
              className="category-badge" 
              style={{ backgroundColor: categoryBadgeColor, color: categoryTextColor }}>
              {event.category}
            </div>
          </div>

          {/* Onderste helft: Tekst en Datum */}
          <div className="content-block">
            {/* De 'Kentekenplaat' Datum */}
            <div className="date-badge">
              <span className="date-day">{day}</span>
              <span className="date-month">{month}</span>
            </div>

            <h3 className="event-title">{event.title}</h3>
            
            <div className="event-location">
              <span style={{marginRight: '8px'}}>📍</span> 
              {event.location}
            </div>

            <button className="hd-button">
              Bekijk Details &gt;
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HDEventCard;