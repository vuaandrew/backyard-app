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

import {
  supabase,
} from "@/lib/supabase";


type Species = {
  id: string;

  common_name: string;

  emoji: string;

  category: string;

  repeat_harvest: boolean;

  base_xp: number;

  typical_yield: number;

  water_every_days: number;

  harvest_cycle_days: number;

  valid_stages: string[];
};


type Plant = {
  id: number;

  name: string;

  emoji: string;

  stage: string;

  user_id: string;

  species_id: string | null;

  last_watered: string | null;

  health: string | null;

  next_harvest_at: string | null;

  estimated_yield: number | null;

  total_harvested: number | null;

  xp_value: number | null;
};


type ScanResult = {
  speciesId: string;

  name: string;

  emoji: string;

  stage: string;

  confidence: number;

  estimatedYield: number;

  daysToHarvest: number;
};


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
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    showScanner,
    setShowScanner,
  ] =
    useState(false);


  const [
    scanPhoto,
    setScanPhoto,
  ] =
    useState<File | null>(
      null
    );


  const [
    scanResult,
    setScanResult,
  ] =
    useState<ScanResult | null>(
      null
    );


  const [
    scanning,
    setScanning,
  ] =
    useState(false);


  const [
    showKnownPlant,
    setShowKnownPlant,
  ] =
    useState(false);


  const [
    selectedSpecies,
    setSelectedSpecies,
  ] =
    useState<Species | null>(
      null
    );


  useEffect(() => {

    initialiseApp();

  }, []);


  async function initialiseApp() {

    setLoading(true);


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

    ]);


    setLoading(false);

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


  function getSpecies(
    plant: Plant
  ) {

    return species.find(
      (item) =>
        item.id ===
        plant.species_id
    );

  }


  async function scanPlant() {

    if (!scanPhoto) {
      return;
    }


    setScanning(
      true
    );


    setScanResult(
      null
    );


    /*
      FAKE AI FOR NOW.

      Later this sends the temporary
      image to our real vision endpoint.
    */


    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          1200
        )
    );


    const tomato =
      species.find(
        (item) =>
          item.id ===
          "tomato"
      );


    if (!tomato) {

      alert(
        "Tomato species data missing."
      );

      setScanning(
        false
      );

      return;
    }


    setScanResult({

      speciesId:
        tomato.id,

      name:
        tomato.common_name,

      emoji:
        tomato.emoji,

      stage:
        "Growing",

      confidence:
        94,

      estimatedYield:
        tomato.typical_yield,

      daysToHarvest:
        1,

    });


    setScanning(
      false
    );

  }


  async function confirmScannedPlant() {

    if (
      !user ||
      !scanResult
    ) {
      return;
    }


    const harvestDate =
      new Date();


    harvestDate.setDate(

      harvestDate.getDate() +

      scanResult.daysToHarvest

    );


    const speciesInfo =
      species.find(

        (item) =>
          item.id ===
          scanResult.speciesId

      );


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
            scanResult.name,

          emoji:
            scanResult.emoji,

          stage:
            scanResult.stage,

          species_id:
            scanResult.speciesId,

          user_id:
            user.id,

          last_watered:
            new Date().toISOString(),

          health:
            "Healthy",

          next_harvest_at:
            harvestDate.toISOString(),

          estimated_yield:
            scanResult.estimatedYield,

          total_harvested:
            0,

          xp_value:
            speciesInfo?.base_xp ??
            10,

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


    if (data) {

      setPlants(
        (current) => [
          ...current,
          ...data,
        ]
      );

    }


    closeScanner();

  }


  async function addKnownSeedling(
    plantSpecies: Species
  ) {

    if (!user) {
      return;
    }


    /*
      Early seedlings are difficult
      for AI to identify reliably.

      User tells us what they planted,
      and the AI can later estimate
      age/health from photos.
    */


    const harvestDate =
      new Date();


    harvestDate.setDate(

      harvestDate.getDate() +

      plantSpecies.harvest_cycle_days

    );


    const firstStage =
      plantSpecies
        .valid_stages[0] ??
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
            plantSpecies.common_name,

          emoji:
            plantSpecies.emoji,

          stage:
            firstStage,

          species_id:
            plantSpecies.id,

          user_id:
            user.id,

          last_watered:
            new Date().toISOString(),

          health:
            "Healthy",

          next_harvest_at:
            harvestDate.toISOString(),

          estimated_yield:
            plantSpecies.typical_yield,

          total_harvested:
            0,

          xp_value:
            plantSpecies.base_xp,

        })
        .select();


    if (error) {

      console.error(
        error
      );

      alert(
        "Could not add seedling."
      );

      return;
    }


    if (data) {

      setPlants(
        (current) => [
          ...current,
          ...data,
        ]
      );

    }


    closeScanner();

  }


  async function waterPlant(
    plant: Plant
  ) {

    if (!user) {
      return;
    }


    const now =
      new Date().toISOString();


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
            now,

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
        error
      );

      alert(
        "Could not water plant."
      );

      return;
    }


    if (data?.[0]) {

      updatePlantLocally(
        data[0]
      );

    }

  }


  async function harvestPlant(
    plant: Plant
  ) {

    if (!user) {
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


    const yieldAmount =
      plant.estimated_yield ??
      plantSpecies?.typical_yield ??
      1;


    /*
      Repeat producers like tomatoes
      create another harvest cycle.

      One-time crops like carrots
      become harvested.
    */


    if (
      plantSpecies?.repeat_harvest
    ) {

      const nextHarvest =
        new Date();


      nextHarvest.setDate(

        nextHarvest.getDate() +

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

            total_harvested:

              (plant.total_harvested ??
                0) +

              yieldAmount,

            stage:
              "Growing",

            next_harvest_at:
              nextHarvest.toISOString(),

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


      if (data?.[0]) {

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

            total_harvested:

              (plant.total_harvested ??
                0) +

              yieldAmount,

            stage:
              "Harvested",

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


      if (data?.[0]) {

        updatePlantLocally(
          data[0]
        );

      }

    }


    alert(
      `🎉 Harvested ${yieldAmount} from ${plant.name}!`
    );

  }


  function updatePlantLocally(
    updated: Plant
  ) {

    setPlants(
      (current) =>
        current.map(
          (plant) =>
            plant.id ===
            updated.id

              ? updated

              : plant
        )
    );

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

      Date.now() >=

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

      difference /

      (
        1000 *
        60 *
        60 *
        24
      )

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


    const wateringInterval =
      plantSpecies
        ?.water_every_days ??
      1;


    const days =
      daysSinceWatered(
        plant
      );


    if (
      days >=
      wateringInterval + 3
    ) {

      return "Dead";

    }


    if (
      days >
      wateringInterval
    ) {

      return "Thirsty";

    }


    return "Healthy";

  }


  async function deletePlant(
    id: number
  ) {

    if (!user) {
      return;
    }


    const confirmed =
      window.confirm(
        "Remove this plant from your garden?"
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
          id
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
          (plant) =>
            plant.id !== id
        )
    );

  }


  function closeScanner() {

    setShowScanner(
      false
    );

    setScanPhoto(
      null
    );

    setScanResult(
      null
    );

    setShowKnownPlant(
      false
    );

    setSelectedSpecies(
      null
    );

  }


  async function signOut() {

    await supabase.auth.signOut();


    router.push(
      "/login"
    );

  }


  const totalHarvested =
    plants.reduce(

      (total, plant) =>

        total +

        (
          plant.total_harvested ??
          0
        ),

      0

    );


  const totalXP =
    plants.reduce(

      (total, plant) =>

        total +

        (
          plant.total_harvested ??
          0
        )

        *

        (
          plant.xp_value ??
          10
        ),

      0

    );


  const gardenLevel =

    Math.floor(
      totalXP / 100
    )

    +

    1;


  if (loading) {

    return (

      <main className="flex min-h-screen items-center justify-center bg-[#f4f7ee]">

        <div className="text-center">

          <div className="text-6xl">
            🌱
          </div>

          <p className="mt-4 font-semibold">
            Loading your garden...
          </p>

        </div>

      </main>

    );

  }


  return (

    <main className="min-h-screen bg-[#f4f7ee] text-[#203020]">

      <section className="mx-auto max-w-6xl px-6 py-10">


        <header className="flex items-start justify-between gap-6">


          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
              Your digital garden
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              My Backyard
            </h1>

            <p className="mt-3 text-gray-600">
              Grow. Water. Harvest. Level up.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              {user?.email}
            </p>

          </div>


          <div className="flex gap-3">


            <button
              onClick={
                signOut
              }
              className="rounded-xl border bg-white px-4 py-3 font-semibold"
            >
              Log out
            </button>


            <button
              onClick={() =>
                setShowScanner(
                  true
                )
              }
              className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white"
            >
              📷 Add Plant
            </button>


          </div>


        </header>


        <section className="mt-10 grid gap-6 md:grid-cols-4">


          <StatCard
            title="Plants"
            value={
              plants.length
            }
          />


          <StatCard
            title="Garden level"
            value={
              gardenLevel
            }
          />


          <StatCard
            title="XP"
            value={
              totalXP
            }
          />


          <StatCard
            title="Harvested"
            value={
              totalHarvested
            }
          />


        </section>


        <section className="mt-10">


          <h2 className="text-2xl font-bold">
            Your Garden
          </h2>


          {plants.length ===
          0 ? (


            <div className="mt-4 rounded-3xl bg-green-100 p-16 text-center">


              <div className="text-7xl">
                🌱
              </div>


              <h3 className="mt-4 text-2xl font-bold">
                Your garden is empty
              </h3>


              <p className="mt-2 text-gray-600">
                Add your first real plant.
              </p>


            </div>


          ) : (


            <div className="mt-4 grid gap-6 md:grid-cols-3">


              {plants.map(
                (plant) => (


                  <PlantCard

                    key={
                      plant.id
                    }

                    plant={
                      plant
                    }

                    health={
                      getPlantHealth(
                        plant
                      )
                    }

                    ready={
                      isReadyToHarvest(
                        plant
                      )
                    }

                    daysLeft={
                      daysUntilHarvest(
                        plant
                      )
                    }

                    onWater={() =>
                      waterPlant(
                        plant
                      )
                    }

                    onHarvest={() =>
                      harvestPlant(
                        plant
                      )
                    }

                    onDelete={() =>
                      deletePlant(
                        plant.id
                      )
                    }

                  />


                )
              )}


            </div>


          )}


        </section>


      </section>


      {showScanner && (


        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-6">


          <div className="my-10 w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">


            <div className="flex items-center justify-between">


              <div>

                <h2 className="text-2xl font-bold">
                  Add Plant
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Scan a plant or tell us what you planted.
                </p>

              </div>


              <button
                onClick={
                  closeScanner
                }
                className="text-xl"
              >
                ✕
              </button>


            </div>


            <button
              onClick={() => {

                setShowKnownPlant(
                  false
                );

              }}
              className="mt-6 w-full rounded-2xl border border-green-300 bg-green-50 p-5 text-left"
            >

              <div className="text-3xl">
                📷
              </div>

              <h3 className="mt-2 font-bold">
                Identify my plant
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Best for established plants.
              </p>

            </button>


            <button
              onClick={() => {

                setShowKnownPlant(
                  true
                );

                setScanPhoto(
                  null
                );

                setScanResult(
                  null
                );

              }}
              className="mt-3 w-full rounded-2xl border border-green-300 bg-green-50 p-5 text-left"
            >

              <div className="text-3xl">
                🌱
              </div>

              <h3 className="mt-2 font-bold">
                I know what I planted
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Best for seeds and young seedlings.
              </p>

            </button>


            {!showKnownPlant && (


              <div className="mt-6">


                <input

                  type="file"

                  accept="image/*"

                  capture="environment"

                  onChange={(
                    event
                  ) => {

                    const file =

                      event
                        .target
                        .files?.[0];


                    if (file) {

                      setScanPhoto(
                        file
                      );

                      setScanResult(
                        null
                      );

                    }

                  }}

                  className="w-full"

                />


                {scanPhoto &&
                  !scanResult && (


                    <button

                      onClick={
                        scanPlant
                      }

                      disabled={
                        scanning
                      }

                      className="mt-5 w-full rounded-xl bg-green-700 px-4 py-3 font-semibold text-white"

                    >

                      {scanning

                        ? "AI is scanning..."

                        : "Identify Plant"}

                    </button>


                  )}


                {scanResult && (


                  <div className="mt-6 rounded-2xl bg-green-50 p-5">


                    <div className="text-6xl">

                      {
                        scanResult.emoji
                      }

                    </div>


                    <h3 className="mt-3 text-2xl font-bold">

                      {
                        scanResult.name
                      }

                    </h3>


                    <p className="mt-2">

                      Stage:{" "}

                      <b>
                        {
                          scanResult.stage
                        }
                      </b>

                    </p>


                    <p>

                      Confidence:{" "}

                      {
                        scanResult.confidence
                      }

                      %

                    </p>


                    <p>

                      Estimated yield:{" "}

                      {
                        scanResult.estimatedYield
                      }

                    </p>


                    <p>

                      Estimated harvest:{" "}

                      {
                        scanResult.daysToHarvest
                      }

                      {" "}day(s)

                    </p>


                    <button

                      onClick={
                        confirmScannedPlant
                      }

                      className="mt-5 w-full rounded-xl bg-green-700 px-4 py-3 font-semibold text-white"

                    >

                      Add to Garden

                    </button>


                  </div>


                )}


              </div>


            )}


            {showKnownPlant && (


              <div className="mt-6">


                <h3 className="font-bold">
                  What did you plant?
                </h3>


                <div className="mt-4 grid grid-cols-2 gap-3">


                  {species.map(
                    (
                      plantSpecies
                    ) => (


                      <button

                        key={
                          plantSpecies.id
                        }

                        onClick={() =>
                          setSelectedSpecies(
                            plantSpecies
                          )
                        }

                        className={`rounded-2xl border p-4 ${
                          selectedSpecies
                            ?.id ===
                          plantSpecies.id

                            ? "border-green-700 bg-green-100"

                            : "border-gray-200"
                        }`}

                      >

                        <div className="text-4xl">
                          {
                            plantSpecies.emoji
                          }
                        </div>

                        <p className="mt-2 font-semibold">
                          {
                            plantSpecies.common_name
                          }
                        </p>

                      </button>


                    )
                  )}


                </div>


                {selectedSpecies && (


                  <button

                    onClick={() =>
                      addKnownSeedling(
                        selectedSpecies
                      )
                    }

                    className="mt-6 w-full rounded-xl bg-green-700 px-4 py-3 font-semibold text-white"

                  >

                    Add{" "}

                    {
                      selectedSpecies.common_name
                    }

                    {" "}Seedling

                  </button>


                )}


              </div>


            )}


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
  health,
  ready,
  daysLeft,
  onWater,
  onHarvest,
  onDelete,
}: {

  plant: Plant;

  health: string;

  ready: boolean;

  daysLeft:
    | number
    | null;

  onWater: () => void;

  onHarvest: () => void;

  onDelete: () => void;

}) {


  const wateredToday =

    plant.last_watered

      ? new Date(
          plant.last_watered
        ).toDateString()

        ===

        new Date()
          .toDateString()

      : false;


  return (

    <div className="rounded-3xl bg-white p-6 text-center shadow-sm">


      <div className="text-6xl">

        {health === "Dead"

          ? "🥀"

          : plant.emoji}

      </div>


      <h3 className="mt-4 text-xl font-bold">
        {plant.name}
      </h3>


      <p className="mt-1 text-sm text-gray-500">
        {plant.stage}
      </p>


      <div className="mt-4">


        {health === "Healthy" && (

          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
            Healthy
          </span>

        )}


        {health === "Thirsty" && (

          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold">
            💧 Thirsty
          </span>

        )}


        {health === "Dead" && (

          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            Dead
          </span>

        )}


      </div>


      {health !==
        "Dead" && (


        <>


          {ready ? (


            <div className="mt-4">


              <p className="font-bold text-green-700">
                ✨ Ready to pick!
              </p>


              <button

                onClick={
                  onHarvest
                }

                className="mt-3 w-full rounded-xl bg-orange-500 px-4 py-3 font-bold text-white"

              >

                🧺 Harvest

              </button>


            </div>


          ) : (


            <p className="mt-4 text-sm text-gray-600">


              {daysLeft === null

                ? "No harvest scheduled"

                : `⏳ ${daysLeft} day(s) until harvest`}


            </p>


          )}


          <button

            onClick={
              onWater
            }

            disabled={
              wateredToday
            }

            className="mt-3 w-full rounded-xl bg-blue-100 px-4 py-3 font-semibold text-blue-800 disabled:cursor-not-allowed disabled:bg-green-100 disabled:text-green-700"

          >

            {wateredToday

              ? "✓ Watered today"

              : "💧 Water"}

          </button>


        </>


      )}


      <p className="mt-4 text-xs text-gray-500">

        Total harvested:{" "}

        {
          plant.total_harvested ??
          0
        }

      </p>


      <button

        onClick={
          onDelete
        }

        className="mt-4 text-xs font-semibold text-red-500"

      >

        Remove plant

      </button>


    </div>

  );

}