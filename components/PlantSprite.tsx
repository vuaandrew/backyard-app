import type { Plant } from "@/types/game";

type Props = {
  plant: Plant;
  health: string;
  ready: boolean;
  selected: boolean;
  onClick: () => void;
};

export default function PlantSprite({
  plant,
  health,
  ready,
  selected,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`relative flex min-h-[120px] flex-col items-center justify-end rounded-2xl border p-3 transition ${
        selected
          ? "border-yellow-400 bg-yellow-100 shadow-lg"
          : "border-green-700/20 bg-[#8dca72] hover:bg-[#98d67c]"
      }`}
    >
      {ready && health !== "Dead" && (
        <div className="absolute -top-3 rounded-full bg-yellow-300 px-2 py-1 text-xs font-bold shadow">
          ✨ PICK
        </div>
      )}

      {health === "Thirsty" && (
        <div className="absolute right-2 top-2 text-xl">
          💧
        </div>
      )}

      <div className="text-5xl drop-shadow">
        {health === "Dead" ? "🥀" : plant.emoji}
      </div>

      <p className="mt-2 text-xs font-bold text-green-950">
        {plant.name}
      </p>

      <p className="text-[10px] text-green-950/70">
        {plant.stage}
      </p>
    </button>
  );
}