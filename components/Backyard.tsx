import PlantSprite from "./PlantSprite";
import type { Plant } from "@/types/game";

type Props = {
  plants: Plant[];
  selectedPlantId: number | null;

  getHealth: (plant: Plant) => string;

  isReady: (plant: Plant) => boolean;

  onSelectPlant: (plant: Plant) => void;
};

export default function Backyard({
  plants,
  selectedPlantId,
  getHealth,
  isReady,
  onSelectPlant,
}: Props) {
  return (
    <div className="relative overflow-hidden rounded-[36px] border-4 border-green-900/20 bg-[#61ad55] shadow-xl">

      {/* SKY / HOUSE AREA */}

      <div className="relative min-h-[230px] bg-gradient-to-b from-sky-200 to-green-200">

        <div className="absolute left-8 top-8 text-7xl">
          🌳
        </div>

        <div className="absolute right-8 top-10 text-7xl">
          🌳
        </div>

        <div className="absolute left-1/2 top-10 -translate-x-1/2 text-center">

          <div className="text-8xl">
            🏡
          </div>

          <p className="mt-1 rounded-full bg-white/80 px-4 py-1 text-xs font-bold">
            YOUR HOME
          </p>

        </div>

      </div>

      {/* GRASS */}

      <div className="relative bg-[#72bb5f] px-5 pb-10 pt-14">

        {/* CHARACTER */}

        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 text-center">

          <div className="text-7xl drop-shadow-lg">
            🧑‍🌾
          </div>

          <div className="rounded-full bg-white px-3 py-1 text-xs font-bold shadow">
            You
          </div>

        </div>

        {/* PATH */}

        <div className="mx-auto mb-6 h-10 max-w-sm rounded-xl bg-[#d5b27d] shadow-inner" />

        {/* GARDEN BED */}

        <div className="rounded-[28px] border-4 border-[#65421f] bg-[#7b4d27] p-4 shadow-inner">

          <div className="mb-3 flex items-center justify-between">

            <h2 className="font-bold text-white">
              🌱 Garden Bed
            </h2>

            <p className="text-xs text-white/80">
              Tap a plant
            </p>

          </div>

          {plants.length === 0 ? (

            <div className="flex min-h-[220px] items-center justify-center rounded-2xl border-2 border-dashed border-white/30">

              <div className="text-center text-white">

                <div className="text-5xl">
                  🌱
                </div>

                <p className="mt-3 font-semibold">
                  Your garden is empty
                </p>

              </div>

            </div>

          ) : (

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">

              {plants.map((plant) => (

                <PlantSprite
                  key={plant.id}
                  plant={plant}
                  health={getHealth(plant)}
                  ready={isReady(plant)}
                  selected={
                    selectedPlantId === plant.id
                  }
                  onClick={() =>
                    onSelectPlant(plant)
                  }
                />

              ))}

            </div>

          )}

        </div>

        {/* DECORATIONS */}

        <div className="mt-5 flex justify-between px-4 text-4xl">
          <span>🌻</span>
          <span>🪵</span>
          <span>🪴</span>
          <span>🌼</span>
        </div>

      </div>

    </div>
  );
}