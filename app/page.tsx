"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Plant = {
  id: number;
  name: string;
  emoji: string;
  stage: string;
};

const plantChoices = [
  { name: "Tomato", emoji: "🍅" },
  { name: "Carrot", emoji: "🥕" },
  { name: "Strawberry", emoji: "🍓" },
  { name: "Chilli", emoji: "🌶️" },
  { name: "Lettuce", emoji: "🥬" },
  { name: "Herb", emoji: "🌿" },
];

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [plantName, setPlantName] = useState("");
  const [plantEmoji, setPlantEmoji] = useState("🌱");
  const [loading, setLoading] = useState(true);

  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [editName, setEditName] = useState("");
  const [editStage, setEditStage] = useState("");

  useEffect(() => {
    loadPlants();
  }, []);

  async function loadPlants() {
    setLoading(true);

    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading plants:", error);
    } else {
      setPlants(data || []);
    }

    setLoading(false);
  }

  function choosePlant(name: string, emoji: string) {
    setPlantName(name);
    setPlantEmoji(emoji);
  }

  async function addPlant() {
    if (!plantName.trim()) return;

    const { data, error } = await supabase
      .from("plants")
      .insert({
        name: plantName,
        emoji: plantEmoji,
        stage: "New",
      })
      .select();

    if (error) {
      console.error("Error adding plant:", error);
      alert("Could not add plant.");
      return;
    }

    if (data) {
      setPlants((currentPlants) => [
        ...currentPlants,
        ...data,
      ]);
    }

    setPlantName("");
    setPlantEmoji("🌱");
    setShowForm(false);
  }

  async function deletePlant(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this plant?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("plants")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting plant:", error);
      alert("Could not delete plant.");
      return;
    }

    setPlants((currentPlants) =>
      currentPlants.filter((plant) => plant.id !== id)
    );
  }

  function startEditing(plant: Plant) {
    setEditingPlant(plant);
    setEditName(plant.name);
    setEditStage(plant.stage);
  }

  async function saveEdit() {
    if (!editingPlant) return;
    if (!editName.trim()) return;

    const { data, error } = await supabase
      .from("plants")
      .update({
        name: editName,
        stage: editStage,
      })
      .eq("id", editingPlant.id)
      .select();

    if (error) {
      console.error("Error updating plant:", error);
      alert("Could not update plant.");
      return;
    }

    if (data && data[0]) {
      setPlants((currentPlants) =>
        currentPlants.map((plant) =>
          plant.id === editingPlant.id ? data[0] : plant
        )
      );
    }

    setEditingPlant(null);
    setEditName("");
    setEditStage("");
  }

  return (
    <main className="min-h-screen bg-[#f4f7ee] text-[#203020]">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex items-center justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
              Your digital garden
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              My Backyard
            </h1>

            <p className="mt-3 max-w-xl text-gray-600">
              Grow your real garden, build its digital twin, and connect with
              growers around you.
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="rounded-2xl bg-green-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-green-800"
          >
            + Add Plant
          </button>
        </header>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <StatCard
            title="Plants growing"
            value={plants.length}
          />

          <StatCard
            title="Garden level"
            value={1}
          />

          <StatCard
            title="Harvests"
            value={0}
          />
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Your Garden
            </h2>
          </div>

          <div className="relative min-h-[420px] overflow-hidden rounded-[32px] border border-green-200 bg-green-100 p-8 shadow-sm">
            <div className="absolute inset-x-0 bottom-0 h-32 bg-green-200" />

            {loading ? (
              <p className="relative">
                Loading garden...
              </p>
            ) : plants.length === 0 ? (
              <div className="relative flex min-h-[300px] items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl">
                    🌱
                  </div>

                  <h3 className="mt-4 text-xl font-bold">
                    Your garden is empty
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Add your first plant to start growing your digital backyard.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative grid gap-6 md:grid-cols-3">
                {plants.map((plant) => (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    onEdit={() => startEditing(plant)}
                    onDelete={() => deletePlant(plant.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Add a plant
              </h2>

              <button
                onClick={() => setShowForm(false)}
                className="text-xl text-gray-500"
              >
                ✕
              </button>
            </div>

            <p className="mt-6 text-sm font-semibold">
              Choose a plant
            </p>

            <div className="mt-3 grid grid-cols-3 gap-3">
              {plantChoices.map((plant) => (
                <button
                  key={plant.name}
                  onClick={() =>
                    choosePlant(
                      plant.name,
                      plant.emoji
                    )
                  }
                  className={`rounded-2xl border p-3 text-center transition ${
                    plantName === plant.name
                      ? "border-green-700 bg-green-100"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-3xl">
                    {plant.emoji}
                  </div>

                  <div className="mt-1 text-xs font-semibold">
                    {plant.name}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <label className="text-sm font-semibold">
                Plant name
              </label>

              <input
                value={plantName}
                onChange={(event) =>
                  setPlantName(event.target.value)
                }
                placeholder="e.g. Roma Tomato"
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              />
            </div>

            <button
              onClick={addPlant}
              disabled={!plantName.trim()}
              className="mt-6 w-full rounded-xl bg-green-700 px-4 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add to garden
            </button>
          </div>
        </div>
      )}

      {editingPlant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Edit plant
              </h2>

              <button
                onClick={() => setEditingPlant(null)}
                className="text-xl text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="mt-6">
              <label className="text-sm font-semibold">
                Plant name
              </label>

              <input
                value={editName}
                onChange={(event) =>
                  setEditName(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              />
            </div>

            <div className="mt-4">
              <label className="text-sm font-semibold">
                Growth stage
              </label>

              <select
                value={editStage}
                onChange={(event) =>
                  setEditStage(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              >
                <option value="New">New</option>
                <option value="Seedling">Seedling</option>
                <option value="Growing">Growing</option>
                <option value="Flowering">Flowering</option>
                <option value="Fruiting">Fruiting</option>
                <option value="Ready to harvest">
                  Ready to harvest
                </option>
              </select>
            </div>

            <button
              onClick={saveEdit}
              className="mt-6 w-full rounded-xl bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800"
            >
              Save changes
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}

function PlantCard({
  plant,
  onEdit,
  onDelete,
}: {
  plant: Plant;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl bg-white/80 p-6 text-center shadow-sm backdrop-blur">
      <div className="text-6xl">
        {plant.emoji}
      </div>

      <h3 className="mt-4 text-lg font-bold">
        {plant.name}
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        {plant.stage}
      </p>

      <div className="mt-5 flex gap-2">
        <button
          onClick={onEdit}
          className="rounded-xl bg-green-100 px-4 py-2 text-sm font-semibold text-green-800 hover:bg-green-200"
        >
          Edit
        </button>

        <button
          onClick={onDelete}
          className="rounded-xl bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200"
        >
          Delete
        </button>
      </div>
    </div>
  );
}