import { Link } from "react-router-dom";
import {
  handleCardBlur,
  handleCardFocus,
  handleCardPointerLeave,
  handleCardPointerMove,
} from "../utils/card3d";
export interface CardTileData {
  _id: string;
  title: string;
  img?: string;
  type?: string;
  cost?: number;
}
interface Props {
  card: CardTileData;
  to?: string;
  state?: unknown;
  className?: string;
}
const CardTile: React.FC<Props> = ({ card, to, state, className }) => {
  const href = to || `/cards/${card._id}`;
  return (
    <div
      className={`card-3d-wrapper w-full max-w-none sm:max-w-[200px] lg:max-w-[220px] xl:max-w-[240px] mx-auto ${
        className ?? ""
      }`.trim()}
    >
      <Link
        to={href}
        state={state}
        className="card-3d group relative block w-full aspect-[2/3] overflow-hidden border border-black/30 shadow-lg"
        onPointerMove={handleCardPointerMove}
        onPointerLeave={handleCardPointerLeave}
        onPointerCancel={handleCardPointerLeave}
        onFocus={handleCardFocus}
        onBlur={handleCardBlur}
      >
        {card.img ? (
          <img
            src={card.img}
            alt={`Carta ${card.title}`}
            className="card-3d-element h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="card-3d-element flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 p-3 sm:p-4 text-center text-white">
            <div className="text-xs sm:text-sm lg:text-base font-semibold break-words">
              {card.title}
            </div>
            <div className="mt-2 text-xs text-gray-200">
              Pulsa para ver detalles
            </div>
          </div>
        )}
      </Link>
    </div>
  );
};
export default CardTile;
