function CardInfo({ card }) {
  if (!card) return null;

  return (
    <div className="card-info-detail">
      <img src={card.image} alt={card.title} className="card-poster" />
      <div className="card-details">
        <h2>{card.title}</h2>
        <div className="badges">
          <span className={`badge badge-type`}>{card.type}</span>
        </div>
        <p className="episode-info">Episode {card.episode}</p>
        {card.rating && <p>Rating: {card.rating}</p>}
        {card.description && <p className="description">{card.description}</p>}
      </div>
    </div>
  )
}

export default CardInfo 