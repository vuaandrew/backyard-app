"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  InventoryItem,
  MarketListingWithProfile,
  Species,
} from "@/types/game";


type Props = {
  currentUserId: string;

  inventory: InventoryItem[];

  species: Species[];

  listings: MarketListingWithProfile[];

  onCreateListing: (input: {
    speciesId: string;
    quantity: number;
    lookingFor: string;
    areaLabel: string;
    travelRadiusKm: number;
  }) => Promise<void>;

  onDeleteListing: (
    listingId: number
  ) => Promise<void>;
};


export default function MarketPanel({
  currentUserId,
  inventory,
  species,
  listings,
  onCreateListing,
  onDeleteListing,
}: Props) {

  const [
    speciesId,
    setSpeciesId,
  ] =
    useState("");


  const [
    quantity,
    setQuantity,
  ] =
    useState(1);


  const [
    lookingFor,
    setLookingFor,
  ] =
    useState("");


  const [
    areaLabel,
    setAreaLabel,
  ] =
    useState("");


  const [
    travelRadiusKm,
    setTravelRadiusKm,
  ] =
    useState(20);


  const [
    creating,
    setCreating,
  ] =
    useState(false);


  const availableInventory =
    useMemo(
      () =>
        inventory.filter(
          (item) =>
            item.quantity > 0
        ),
      [
        inventory,
      ]
    );


  function getSpeciesById(
    id: string
  ) {

    return species.find(
      (item) =>
        item.id === id
    );

  }


  const selectedInventoryItem =
    inventory.find(
      (item) =>
        item.species_id ===
        speciesId
    );


  const maxQuantity =
    selectedInventoryItem
      ?.quantity
    ??
    0;


  async function createListing() {

    if (!speciesId) {

      alert(
        "Choose something from your harvest basket."
      );

      return;

    }


    if (
      quantity < 1
    ) {

      alert(
        "Quantity must be at least 1."
      );

      return;

    }


    if (
      quantity >
      maxQuantity
    ) {

      alert(
        "You do not have that many available."
      );

      return;

    }


    if (
      !areaLabel.trim()
    ) {

      alert(
        "Enter a general area such as your suburb or region."
      );

      return;

    }


    setCreating(
      true
    );


    await onCreateListing({

      speciesId,

      quantity,

      lookingFor:
        lookingFor.trim(),

      areaLabel:
        areaLabel.trim(),

      travelRadiusKm,

    });


    setSpeciesId(
      ""
    );

    setQuantity(
      1
    );

    setLookingFor(
      ""
    );


    setCreating(
      false
    );

  }


  return (

    <section className="space-y-6">


      <div className="rounded-[32px] bg-gradient-to-br from-amber-100 to-green-100 p-6 shadow">


        <p className="text-xs font-bold uppercase tracking-widest text-green-700">

          Local trading

        </p>


        <h1 className="mt-1 text-3xl font-black">

          🏪 Local Market

        </h1>


        <p className="mt-2 max-w-xl text-sm text-gray-600">

          Offer produce from your harvest basket and discover other gardeners.

          We only use a general area and travel radius here — not your exact home address.

        </p>


      </div>


      {/* CREATE LISTING */}

      <div className="rounded-3xl bg-white p-6 shadow">


        <h2 className="text-xl font-black">

          Create a listing

        </h2>


        <p className="mt-1 text-sm text-gray-500">

          Pick something you already harvested.

        </p>


        {availableInventory.length ===
        0 ? (


          <div className="mt-5 rounded-2xl bg-gray-50 p-6 text-center">


            <div className="text-5xl">

              🧺

            </div>


            <p className="mt-3 font-bold">

              Nothing available to trade yet

            </p>


            <p className="mt-1 text-sm text-gray-500">

              Harvest produce first, then list it here.

            </p>


          </div>


        ) : (


          <>


            <label className="mt-5 block text-sm font-bold">

              Offering

            </label>


            <select
              value={
                speciesId
              }
              onChange={(
                event
              ) => {

                setSpeciesId(
                  event.target.value
                );

                setQuantity(
                  1
                );

              }}
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
            >


              <option value="">

                Choose produce

              </option>


              {availableInventory.map(
                (item) => {


                  const itemSpecies =
                    getSpeciesById(
                      item.species_id
                    );


                  return (


                    <option
                      key={
                        item.id
                      }
                      value={
                        item.species_id
                      }
                    >

                      {
                        itemSpecies
                          ?.emoji
                        ??
                        "🌱"
                      }

                      {" "}

                      {
                        itemSpecies
                          ?.common_name
                        ??
                        item.species_id
                      }

                      {" "}×
                      {
                        item.quantity
                      }

                    </option>


                  );

                }
              )}


            </select>


            <label className="mt-5 block text-sm font-bold">

              Quantity to offer

            </label>


            <input
              type="number"
              min={1}
              max={
                Math.max(
                  maxQuantity,
                  1
                )
              }
              value={
                quantity
              }
              onChange={(
                event
              ) =>
                setQuantity(
                  Number(
                    event.target.value
                  )
                )
              }
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"
            />


            <p className="mt-1 text-xs text-gray-400">

              Available:{" "}

              {maxQuantity}

            </p>


            <label className="mt-5 block text-sm font-bold">

              Looking for

            </label>


            <input
              value={
                lookingFor
              }
              onChange={(
                event
              ) =>
                setLookingFor(
                  event.target.value
                )
              }
              maxLength={80}
              placeholder="Example: strawberry seedlings, basil, compost..."
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"
            />


            <label className="mt-5 block text-sm font-bold">

              General area

            </label>


            <input
              value={
                areaLabel
              }
              onChange={(
                event
              ) =>
                setAreaLabel(
                  event.target.value
                )
              }
              maxLength={60}
              placeholder="Example: Inner North, Geelong, CBD..."
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"
            />


            <label className="mt-5 block text-sm font-bold">

              Willing to travel

            </label>


            <div className="mt-3 grid grid-cols-4 gap-2">


              {[
                10,
                20,
                40,
                80,
              ].map(
                (
                  radius
                ) => (


                  <button
                    key={
                      radius
                    }
                    type="button"
                    onClick={() =>
                      setTravelRadiusKm(
                        radius
                      )
                    }
                    className={`rounded-xl border px-3 py-3 text-sm font-bold ${
                      travelRadiusKm ===
                      radius

                        ? "border-green-700 bg-green-100 text-green-800"

                        : "border-gray-200 bg-gray-50"
                    }`}
                  >

                    {
                      radius
                    }{" "}
                    km

                  </button>


                )
              )}


            </div>


            <button
              onClick={
                createListing
              }
              disabled={
                creating
              }
              className="mt-6 w-full rounded-xl bg-green-700 px-5 py-4 font-bold text-white disabled:opacity-50"
            >

              {creating

                ? "Creating listing..."

                : "List at Local Market"}

            </button>


          </>


        )}


      </div>


      {/* MARKET LISTINGS */}

      <div>


        <p className="text-xs font-bold uppercase tracking-widest text-green-700">

          Nearby listings

        </p>


        <h2 className="mt-1 text-2xl font-black">

          Gardeners trading now

        </h2>


        {listings.length ===
        0 ? (


          <div className="mt-4 rounded-3xl border-2 border-dashed border-green-300 bg-white/70 p-10 text-center">


            <div className="text-5xl">

              🪴

            </div>


            <p className="mt-3 font-bold">

              No market listings yet

            </p>


            <p className="mt-1 text-sm text-gray-500">

              Your first listing can be the first one.

            </p>


          </div>


        ) : (


          <div className="mt-4 grid gap-4">


            {listings.map(
              (
                listing
              ) => {


                const listingSpecies =
                  getSpeciesById(
                    listing.species_id
                  );


                const mine =

                  listing.user_id ===
                  currentUserId;


                return (


                  <div
                    key={
                      listing.id
                    }
                    className="rounded-3xl bg-white p-5 shadow"
                  >


                    <div className="flex items-start justify-between gap-4">


                      <div className="flex items-center gap-3">


                        <div className="text-5xl">

                          {
                            listing.profile
                              ?.avatar_emoji
                            ??
                            "🧑‍🌾"
                          }

                        </div>


                        <div>


                          <h3 className="font-black">

                            {
                              listing.profile
                                ?.display_name
                              ??
                              "Gardener"
                            }

                          </h3>


                          <p className="text-xs text-gray-500">

                            {
                              listing.area_label
                            }

                            {" • up to "}

                            {
                              listing.travel_radius_km
                            }

                            {" km"}

                          </p>


                          <p className="mt-1 text-xs text-gray-500">

                            {listing.profile
                              ?.ratings_count

                              ? `⭐ ${listing.profile.reputation_score.toFixed(
                                  1
                                )}`

                              : "🌱 New gardener"}

                            {" • "}

                            {
                              listing.profile
                                ?.completed_trades
                              ??
                              0
                            }

                            {" trades"}

                          </p>


                        </div>


                      </div>


                      {mine && (


                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">

                          Your listing

                        </span>


                      )}


                    </div>


                    <div className="mt-5 rounded-2xl bg-green-50 p-4">


                      <p className="text-xs font-bold uppercase tracking-wide text-green-700">

                        Offering

                      </p>


                      <div className="mt-2 flex items-center gap-3">


                        <div className="text-4xl">

                          {
                            listingSpecies
                              ?.emoji
                            ??
                            "🌱"
                          }

                        </div>


                        <div>


                          <p className="font-black">

                            {
                              listingSpecies
                                ?.common_name
                              ??
                              listing.species_id
                            }

                          </p>


                          <p className="text-sm text-gray-600">

                            Quantity:{" "}

                            {
                              listing.quantity
                            }

                          </p>


                        </div>


                      </div>


                    </div>


                    <div className="mt-3 rounded-2xl bg-amber-50 p-4">


                      <p className="text-xs font-bold uppercase tracking-wide text-amber-700">

                        Looking for

                      </p>


                      <p className="mt-2 text-sm font-semibold">

                        {
                          listing.looking_for
                          ||
                          "Open to offers"
                        }

                      </p>


                    </div>


                    {mine ? (


                      <button
                        onClick={() =>
                          onDeleteListing(
                            listing.id
                          )
                        }
                        className="mt-4 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-600"
                      >

                        Remove listing

                      </button>


                    ) : (


                      <button
                        disabled
                        className="mt-4 w-full rounded-xl bg-green-700 px-4 py-3 font-bold text-white opacity-60"
                      >

                        💬 Trade request coming next

                      </button>


                    )}


                  </div>


                );

              }
            )}


          </div>


        )}


      </div>


    </section>

  );

}