"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import type {
  User,
} from "@supabase/supabase-js";

import Backyard from "@/components/Backyard";

import {
  supabase,
} from "@/lib/supabase";

import type {
  HarvestEvent,
  InventoryItem,
  Plant,
  Species,
} from "@/types/game";


export default function Home() {

  const router =
    useRouter();


  const [
    user,
    setUser,
  ] =
    useState<User | null>(
      null
    );


  const [
    plants,
    setPlants,
  ] =
    useState<Plant[]>([]);


  const [
    species,
    setSpecies,
  ] =
    useState<Species[]>([]);


  const [
    inventory,
    setInventory,
  ] =
    useState<InventoryItem[]>([]);


  const [
    harvestEvents,
    setHarvestEvents,
  ] =
    useState<HarvestEvent[]>([]);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    selectedPlant,
    setSelectedPlant,
  ] =
    useState<Plant | null>(
      null
    );


  const [
    showAddPlant,
    setShowAddPlant,
  ] =
    useState(false);


  useEffect(() => {

    initialiseApp();

  }, []);


  async function initialiseApp() {

    setLoading(
      true
    );


    const {
      data: {
        user,
      },
      error,
    } =
      await supabase.auth.getUser();


    if (
      error ||
      !user
    ) {

      router.push(
        "/login"
      );

      return;
    }


    setUser(
      user
    );


    await Promise.all([

      loadSpecies(),

      loadPlants(
        user.id
      ),

      loadInventory(
        user.id
      ),

      loadHarvestEvents(
        user.id
      ),

    ]);


    setLoading(
      false
    );

  }


  async function loadSpecies() {

    const {
      data,
      error,
    } =
      await supabase
        .from(
          "plant_species"
        )
        .select("*")
        .order(
          "common_name"
        );


    if (error) {

      console.error(
        "Species error:",
        error
      );

      return;
    }


    setSpecies(
      data || []
    );

  }


  async function loadPlants(
    userId: string
  ) {

    const {
      data,
      error,
    } =
      await supabase
        .from(
          "plants"
        )
        .select("*")
        .eq(
          "user_id",
          userId
        )
        .order(
          "created_at",
          {
            ascending: true,
          }
        );


    if (error) {

      console.error(
        "Plants error:",
        error
      );

      return;
    }


    setPlants(
      data || []
    );

  }


  async function loadInventory(
    userId: string
  ) {

    const {
      data,
      error,
    } =
      await supabase
        .from(
          "inventory"
        )
        .select("*")
        .eq(
          "user_id",
          userId
        )
        .order(
          "species_id"
        );


    if (error) {

      console.error(
        "Inventory error:",
        error
      );

      return;
    }


    setInventory(
      data || []
    );

  }


  async function loadHarvestEvents(
    userId: string
  ) {

    const {
      data,
      error,
    } =
      await supabase
        .from(
          "harvest_events"
        )
        .select("*")
        .eq(
          "user_id",
          userId
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );


    if (error) {

      console.error(
        "Harvest events error:",
        error
      );

      return;
    }


    setHarvestEvents(
      data || []
    );

  }


  function getSpecies(
    plant: Plant
  ) {

    return species.find(

      (item) =>
        item.id ===
        plant.species_id

    );

  }


  function getSpeciesById(
    speciesId: string
  ) {

    return species.find(

      (item) =>
        item.id ===
        speciesId

    );

  }


  function updatePlantLocally(
    updatedPlant: Plant
  ) {

    setPlants(
      (current) =>
        current.map(
          (plant) =>
            plant.id ===
            updatedPlant.id

              ? updatedPlant

              : plant
        )
    );


    setSelectedPlant(
      updatedPlant
    );

  }


  function daysSinceWatered(
    plant: Plant
  ) {

    if (
      !plant.last_watered
    ) {

      return 999;

    }


    return Math.floor(

      (
        Date.now()

        -

        new Date(
          plant.last_watered
        ).getTime()
      )

      /

      (
        1000 *
        60 *
        60 *
        24
      )

    );

  }


  function getPlantHealth(
    plant: Plant
  ) {

    const plantSpecies =
      getSpecies(
        plant
      );


    const interval =

      plantSpecies
        ?.water_every_days

      ??

      1;


    const days =

      daysSinceWatered(
        plant
      );


    if (
      days >=
      interval + 3
    ) {

      return "Dead";

    }


    if (
      days >
      interval
    ) {

      return "Thirsty";

    }


    return "Healthy";

  }


  function isReadyToHarvest(
    plant: Plant
  ) {

    if (
      !plant.next_harvest_at
    ) {

      return false;

    }


    return (

      Date.now()

      >=

      new Date(
        plant.next_harvest_at
      ).getTime()

    );

  }


  function daysUntilHarvest(
    plant: Plant
  ) {

    if (
      !plant.next_harvest_at
    ) {

      return null;

    }


    const difference =

      new Date(
        plant.next_harvest_at
      ).getTime()

      -

      Date.now();


    if (
      difference <= 0
    ) {

      return 0;

    }


    return Math.ceil(

      difference

      /

      (
        1000 *
        60 *
        60 *
        24
      )

    );

  }


  function wateredToday(
    plant: Plant
  ) {

    if (
      !plant.last_watered
    ) {

      return false;

    }


    return (

      new Date(
        plant.last_watered
      ).toDateString()

      ===

      new Date()
        .toDateString()

    );

  }


  async function waterPlant(
    plant: Plant
  ) {

    if (!user) {
      return;
    }


    if (
      wateredToday(
        plant
      )
    ) {

      return;
    }


    const {
      data,
      error,
    } =
      await supabase
        .from(
          "plants"
        )
        .update({

          last_watered:
            new Date()
              .toISOString(),

          health:
            "Healthy",

        })
        .eq(
          "id",
          plant.id
        )
        .eq(
          "user_id",
          user.id
        )
        .select();


    if (error) {

      console.error(
        "Water error:",
        error
      );

      alert(
        "Could not water plant."
      );

      return;
    }


    if (
      data?.[0]
    ) {

      updatePlantLocally(
        data[0]
      );

    }

  }


  async function addToInventory(
    speciesId: string,
    quantity: number
  ) {

    if (!user) {
      return false;
    }


    const existing =
      inventory.find(

        (item) =>
          item.species_id ===
          speciesId

      );


    if (existing) {

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "inventory"
          )
          .update({

            quantity:

              existing.quantity

              +

              quantity,

            updated_at:
              new Date()
                .toISOString(),

          })
          .eq(
            "id",
            existing.id
          )
          .eq(
            "user_id",
            user.id
          )
          .select();


      if (error) {

        console.error(
          error
        );

        return false;
      }


      if (
        data?.[0]
      ) {

        setInventory(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                existing.id

                  ? data[0]

                  : item
            )
        );

      }


      return true;

    }


    const {
      data,
      error,
    } =
      await supabase
        .from(
          "inventory"
        )
        .insert({

          user_id:
            user.id,

          species_id:
            speciesId,

          quantity,

        })
        .select();


    if (error) {

      console.error(
        error
      );

      return false;
    }


    if (
      data?.[0]
    ) {

      setInventory(
        (current) => [
          ...current,
          data[0],
        ]
      );

    }


    return true;

  }


  async function recordHarvest(
    plant: Plant,
    quantity: number,
    xpEarned: number
  ) {

    if (!user) {
      return false;
    }


    const {
      data,
      error,
    } =
      await supabase
        .from(
          "harvest_events"
        )
        .insert({

          user_id:
            user.id,

          plant_id:
            plant.id,

          species_id:
            plant.species_id,

          quantity,

          xp_earned:
            xpEarned,

        })
        .select();


    if (error) {

      console.error(
        error
      );

      return false;
    }


    if (
      data?.[0]
    ) {

      setHarvestEvents(
        (current) => [
          data[0],
          ...current,
        ]
      );

    }


    return true;

  }


  async function harvestPlant(
    plant: Plant
  ) {

    if (
      !user ||
      !plant.species_id
    ) {

      return;

    }


    if (
      !isReadyToHarvest(
        plant
      )
    ) {

      return;

    }


    const plantSpecies =
      getSpecies(
        plant
      );


    if (!plantSpecies) {

      alert(
        "Species rules missing."
      );

      return;

    }


    const yieldAmount =

      plant.estimated_yield

      ??

      plantSpecies
        .typical_yield

      ??

      1;


    const xpEarned =

      yieldAmount

      *

      plantSpecies
        .base_xp;


    const inventoryWorked =
      await addToInventory(

        plant.species_id,

        yieldAmount

      );


    if (!inventoryWorked) {

      alert(
        "Could not update inventory."
      );

      return;

    }


    const eventWorked =
      await recordHarvest(

        plant,

        yieldAmount,

        xpEarned

      );


    if (!eventWorked) {

      alert(
        "Could not record harvest."
      );

      return;

    }


    if (
      plantSpecies
        .repeat_harvest
    ) {

      const nextHarvest =
        new Date();


      nextHarvest.setDate(

        nextHarvest.getDate()

        +

        plantSpecies
          .harvest_cycle_days

      );


      const {
        data,
        error,
      } =
        await supabase
          .from(
            "plants"
          )
          .update({

            stage:
              "Growing",

            total_harvested:

              (
                plant.total_harvested
                ??
                0
              )

              +

              yieldAmount,

            next_harvest_at:
              nextHarvest
                .toISOString(),

          })
          .eq(
            "id",
            plant.id
          )
          .eq(
            "user_id",
            user.id
          )
          .select();


      if (error) {

        console.error(
          error
        );

        return;

      }


      if (
        data?.[0]
      ) {

        updatePlantLocally(
          data[0]
        );

      }

    } else {

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "plants"
          )
          .update({

            stage:
              "Harvested",

            total_harvested:

              (
                plant.total_harvested
                ??
                0
              )

              +

              yieldAmount,

            next_harvest_at:
              null,

          })
          .eq(
            "id",
            plant.id
          )
          .eq(
            "user_id",
            user.id
          )
          .select();


      if (error) {

        console.error(
          error
        );

        return;

      }


      if (
        data?.[0]
      ) {

        updatePlantLocally(
          data[0]
        );

      }

    }


    alert(
      `🧺 +${yieldAmount} ${plant.name} • +${xpEarned} XP`
    );

  }


  async function addKnownPlant(
    plantSpecies: Species
  ) {

    if (!user) {
      return;
    }


    const harvestDate =
      new Date();


    harvestDate.setDate(

      harvestDate.getDate()

      +

      plantSpecies
        .harvest_cycle_days

    );


    const firstStage =

      plantSpecies
        .valid_stages[0]

      ??

      "Seedling";


    const {
      data,
      error,
    } =
      await supabase
        .from(
          "plants"
        )
        .insert({

          name:
            plantSpecies
              .common_name,

          emoji:
            plantSpecies
              .emoji,

          stage:
            firstStage,

          species_id:
            plantSpecies.id,

          user_id:
            user.id,

          last_watered:
            new Date()
              .toISOString(),

          health:
            "Healthy",

          next_harvest_at:
            harvestDate
              .toISOString(),

          estimated_yield:
            plantSpecies
              .typical_yield,

          total_harvested:
            0,

          xp_value:
            plantSpecies
              .base_xp,

        })
        .select();


    if (error) {

      console.error(
        error
      );

      alert(
        "Could not add plant."
      );

      return;

    }


    if (
      data?.[0]
    ) {

      setPlants(
        (current) => [
          ...current,
          data[0],
        ]
      );

    }


    setShowAddPlant(
      false
    );

  }


  async function removePlant(
    plant: Plant
  ) {

    if (!user) {
      return;
    }


    const confirmed =
      window.confirm(
        `Remove ${plant.name} from your backyard?`
      );


    if (!confirmed) {
      return;
    }


    const {
      error,
    } =
      await supabase
        .from(
          "plants"
        )
        .delete()
        .eq(
          "id",
          plant.id
        )
        .eq(
          "user_id",
          user.id
        );


    if (error) {

      console.error(
        error
      );

      return;

    }


    setPlants(
      (current) =>
        current.filter(
          (item) =>
            item.id !==
            plant.id
        )
    );


    setSelectedPlant(
      null
    );

  }


  async function signOut() {

    await supabase.auth.signOut();


    router.push(
      "/login"
    );

  }


  const totalXP =

    harvestEvents.reduce(

      (total, event) =>

        total

        +

        event.xp_earned,

      0

    );


  const gardenLevel =

    Math.floor(
      totalXP / 100
    )

    +

    1;


  const totalHarvested =

    harvestEvents.reduce(

      (total, event) =>

        total

        +

        event.quantity,

      0

    );


  if (loading) {

    return (

      <main className="flex min-h-screen items-center justify-center bg-green-100">

        <div className="text-center">

          <div className="text-7xl">
            🌱
          </div>

          <p className="mt-4 font-bold">
            Entering your backyard...
          </p>

        </div>

      </main>

    );

  }


  return (

    <main className="min-h-screen bg-[#e9f2df] text-[#203020]">


      {/* GAME HUD */}

      <header className="sticky top-0 z-40 border-b border-green-900/10 bg-white/95 shadow-sm backdrop-blur">

        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">


          <div>

            <p className="text-xs font-bold uppercase tracking-widest text-green-700">
              Backyard
            </p>

            <h1 className="text-xl font-black">
              🌿 My Garden
            </h1>

          </div>


          <div className="flex items-center gap-2 text-sm">


            <div className="rounded-xl bg-yellow-100 px-3 py-2 font-bold">
              ⭐ {totalXP} XP
            </div>


            <div className="rounded-xl bg-green-100 px-3 py-2 font-bold">
              LVL {gardenLevel}
            </div>


          </div>


        </div>

      </header>


      <div className="mx-auto max-w-6xl px-4 py-6">


        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">


          <div>

            <p className="font-bold">
              Welcome home 👋
            </p>

            <p className="text-xs text-gray-500">
              {user?.email}
            </p>

          </div>


          <div className="flex gap-2">


            <button
              onClick={() =>
                setShowAddPlant(
                  true
                )
              }
              className="rounded-xl bg-green-700 px-4 py-3 font-bold text-white shadow"
            >
              🌱 Add Plant
            </button>


            <button
              onClick={
                signOut
              }
              className="rounded-xl border bg-white px-4 py-3 font-semibold"
            >
              Log out
            </button>


          </div>


        </div>


        <Backyard

          plants={
            plants
          }

          selectedPlantId={
            selectedPlant?.id
            ??
            null
          }

          getHealth={
            getPlantHealth
          }

          isReady={
            isReadyToHarvest
          }

          onSelectPlant={
            setSelectedPlant
          }

        />


        {/* SELECTED PLANT ACTION PANEL */}

        {selectedPlant && (

          <section className="mt-5 rounded-3xl bg-white p-5 shadow">


            <div className="flex items-start justify-between">


              <div className="flex items-center gap-4">


                <div className="text-6xl">

                  {getPlantHealth(
                    selectedPlant
                  ) === "Dead"

                    ? "🥀"

                    : selectedPlant
                        .emoji}

                </div>


                <div>

                  <h2 className="text-2xl font-black">
                    {
                      selectedPlant.name
                    }
                  </h2>

                  <p className="text-sm text-gray-500">
                    {
                      selectedPlant.stage
                    }
                  </p>

                  <p className="mt-1 text-sm font-semibold text-green-700">
                    {
                      getPlantHealth(
                        selectedPlant
                      )
                    }
                  </p>

                </div>


              </div>


              <button
                onClick={() =>
                  setSelectedPlant(
                    null
                  )
                }
              >
                ✕
              </button>


            </div>


            {getPlantHealth(
              selectedPlant
            ) !== "Dead" && (


              <div className="mt-5 grid gap-3 sm:grid-cols-2">


                <button
                  onClick={() =>
                    waterPlant(
                      selectedPlant
                    )
                  }
                  disabled={
                    wateredToday(
                      selectedPlant
                    )
                  }
                  className="rounded-xl bg-blue-100 px-4 py-4 font-bold text-blue-800 disabled:bg-green-100 disabled:text-green-700"
                >

                  {wateredToday(
                    selectedPlant
                  )

                    ? "✓ Watered today"

                    : "💧 Water"}

                </button>


                {isReadyToHarvest(
                  selectedPlant
                ) ? (


                  <button
                    onClick={() =>
                      harvestPlant(
                        selectedPlant
                      )
                    }
                    className="rounded-xl bg-orange-500 px-4 py-4 font-black text-white"
                  >
                    🧺 Harvest
                  </button>


                ) : (


                  <div className="flex items-center justify-center rounded-xl bg-gray-100 px-4 py-4 text-sm font-semibold">

                    ⏳{" "}

                    {daysUntilHarvest(
                      selectedPlant
                    ) ??
                      "?"}

                    {" "}day(s)

                  </div>


                )}


              </div>


            )}


            <button
              onClick={() =>
                removePlant(
                  selectedPlant
                )
              }
              className="mt-4 text-xs font-semibold text-red-500"
            >
              Remove plant
            </button>


          </section>

        )}


        {/* INVENTORY */}

        <section className="mt-7">


          <div className="flex items-end justify-between">


            <div>

              <p className="text-xs font-bold uppercase tracking-widest text-green-700">
                Inventory
              </p>

              <h2 className="text-2xl font-black">
                🧺 Harvest Basket
              </h2>

            </div>


            <p className="text-sm font-semibold text-gray-500">
              {totalHarvested} harvested
            </p>


          </div>


          {inventory.length ===
          0 ? (


            <div className="mt-3 rounded-3xl border-2 border-dashed border-green-300 bg-white/70 p-8 text-center">

              <div className="text-5xl">
                🧺
              </div>

              <p className="mt-2 font-semibold">
                Basket empty
              </p>

            </div>


          ) : (


            <div className="mt-3 flex gap-3 overflow-x-auto pb-2">


              {inventory.map(
                (item) => {


                  const itemSpecies =
                    getSpeciesById(
                      item.species_id
                    );


                  return (

                    <div
                      key={
                        item.id
                      }
                      className="min-w-[130px] rounded-2xl bg-white p-4 text-center shadow"
                    >

                      <div className="text-4xl">

                        {
                          itemSpecies
                            ?.emoji
                          ??
                          "🌱"
                        }

                      </div>

                      <p className="mt-2 text-sm font-bold">

                        {
                          itemSpecies
                            ?.common_name
                          ??
                          item.species_id
                        }

                      </p>

                      <p className="text-lg font-black text-green-700">

                        ×
                        {
                          item.quantity
                        }

                      </p>

                    </div>

                  );

                }
              )}


            </div>


          )}


        </section>


        {/* FUTURE GAME NAVIGATION */}

        <section className="mt-7 grid grid-cols-3 gap-3">


          <button className="rounded-2xl bg-white p-4 text-center shadow">

            <div className="text-3xl">
              🏡
            </div>

            <p className="mt-1 text-xs font-bold">
              Backyard
            </p>

          </button>


          <button
            disabled
            className="rounded-2xl bg-white/60 p-4 text-center opacity-60 shadow"
          >

            <div className="text-3xl">
              🏪
            </div>

            <p className="mt-1 text-xs font-bold">
              Local Market
            </p>

          </button>


          <button
            disabled
            className="rounded-2xl bg-white/60 p-4 text-center opacity-60 shadow"
          >

            <div className="text-3xl">
              👤
            </div>

            <p className="mt-1 text-xs font-bold">
              Profile
            </p>

          </button>


        </section>


      </div>


      {/* ADD PLANT MODAL */}

      {showAddPlant && (


        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-5">


          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">


            <div className="flex items-center justify-between">


              <div>

                <h2 className="text-2xl font-black">
                  Add Plant
                </h2>

                <p className="text-sm text-gray-500">
                  Choose what you planted.
                </p>

              </div>


              <button
                onClick={() =>
                  setShowAddPlant(
                    false
                  )
                }
                className="text-xl"
              >
                ✕
              </button>


            </div>


            <div className="mt-5 grid grid-cols-2 gap-3">


              {species.map(
                (
                  plantSpecies
                ) => (


                  <button
                    key={
                      plantSpecies.id
                    }
                    onClick={() =>
                      addKnownPlant(
                        plantSpecies
                      )
                    }
                    className="rounded-2xl border border-green-200 bg-green-50 p-5 transition hover:bg-green-100"
                  >

                    <div className="text-5xl">
                      {
                        plantSpecies.emoji
                      }
                    </div>

                    <p className="mt-2 font-bold">
                      {
                        plantSpecies.common_name
                      }
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Add seedling
                    </p>

                  </button>


                )
              )}


            </div>


            <div className="mt-5 rounded-2xl bg-gray-100 p-4">

              <p className="text-sm font-semibold">
                📷 AI scanning coming later
              </p>

              <p className="mt-1 text-xs text-gray-500">
                We are building the whole game first.
              </p>

            </div>


          </div>


        </div>


      )}


    </main>

  );

}