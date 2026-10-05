"use client";

import {
  useState,
} from "react";

import type {
  Profile,
} from "@/types/game";


type Props = {

  profile: Profile;

  email: string;

  level: number;

  xp: number;

  harvested: number;

  plantCount: number;

  onSave: (
    displayName: string,
    avatarEmoji: string,
    bio: string
  ) => Promise<void>;

};


const avatarChoices = [
  "🧑‍🌾",
  "👩‍🌾",
  "👨‍🌾",
  "🧑",
  "👩",
  "👨",
  "🧙",
  "🧝",
];


export default function ProfilePanel({
  profile,
  email,
  level,
  xp,
  harvested,
  plantCount,
  onSave,
}: Props) {

  const [
    displayName,
    setDisplayName,
  ] =
    useState(
      profile.display_name
    );


  const [
    avatarEmoji,
    setAvatarEmoji,
  ] =
    useState(
      profile.avatar_emoji
    );


  const [
    bio,
    setBio,
  ] =
    useState(
      profile.bio
    );


  const [
    saving,
    setSaving,
  ] =
    useState(false);


  const [
    saved,
    setSaved,
  ] =
    useState(false);


  async function saveProfile() {

    setSaving(
      true
    );

    setSaved(
      false
    );


    await onSave(
      displayName.trim() || "Gardener",
      avatarEmoji,
      bio.trim()
    );


    setSaving(
      false
    );

    setSaved(
      true
    );


    setTimeout(
      () =>
        setSaved(
          false
        ),
      1800
    );

  }


  const reputationText =

    profile.ratings_count > 0

      ? `${profile.reputation_score.toFixed(1)} / 5`

      : "New gardener";


  return (

    <section className="space-y-5">


      {/* PROFILE HEADER */}

      <div className="rounded-[32px] bg-gradient-to-br from-green-100 to-emerald-200 p-6 shadow">


        <div className="flex flex-col items-center text-center">


          <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-green-50 text-7xl shadow-lg">

            {avatarEmoji}

          </div>


          <h1 className="mt-4 text-3xl font-black">

            {displayName || "Gardener"}

          </h1>


          <p className="mt-1 text-sm text-green-900/60">

            {email}

          </p>


          <div className="mt-4 flex flex-wrap justify-center gap-2">


            <div className="rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm">

              ⭐ Level {level}

            </div>


            <div className="rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm">

              ✨ {xp} XP

            </div>


            <div className="rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm">

              🤝 {reputationText}

            </div>


          </div>


        </div>


      </div>


      {/* STATS */}

      <div className="grid grid-cols-2 gap-3">


        <StatBox
          emoji="🌱"
          label="Plants"
          value={plantCount}
        />


        <StatBox
          emoji="🧺"
          label="Harvested"
          value={harvested}
        />


        <StatBox
          emoji="🤝"
          label="Trades"
          value={
            profile.completed_trades
          }
        />


        <StatBox
          emoji="⭐"
          label="Ratings"
          value={
            profile.ratings_count
          }
        />


      </div>


      {/* EDIT PROFILE */}

      <div className="rounded-3xl bg-white p-6 shadow">


        <h2 className="text-xl font-black">

          Edit gardener

        </h2>


        <p className="mt-1 text-sm text-gray-500">

          This will eventually be what other gardeners see in the Local Market.

        </p>


        <label className="mt-5 block text-sm font-bold">

          Display name

        </label>


        <input
          value={
            displayName
          }
          onChange={(event) =>
            setDisplayName(
              event.target.value
            )
          }
          maxLength={30}
          className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
          placeholder="Your gardener name"
        />


        <label className="mt-5 block text-sm font-bold">

          Character

        </label>


        <div className="mt-3 grid grid-cols-4 gap-3">


          {avatarChoices.map(
            (avatar) => (

              <button
                key={
                  avatar
                }
                type="button"
                onClick={() =>
                  setAvatarEmoji(
                    avatar
                  )
                }
                className={`rounded-2xl border p-4 text-4xl transition ${
                  avatarEmoji === avatar

                    ? "border-green-700 bg-green-100 shadow"

                    : "border-gray-200 bg-gray-50"
                }`}
              >

                {avatar}

              </button>

            )
          )}


        </div>


        <label className="mt-5 block text-sm font-bold">

          About your garden

        </label>


        <textarea
          value={
            bio
          }
          onChange={(event) =>
            setBio(
              event.target.value
            )
          }
          maxLength={180}
          rows={4}
          className="mt-2 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
          placeholder="Tell other gardeners a little about your backyard..."
        />


        <div className="mt-2 text-right text-xs text-gray-400">

          {bio.length}/180

        </div>


        <button
          onClick={
            saveProfile
          }
          disabled={
            saving
          }
          className="mt-5 w-full rounded-xl bg-green-700 px-5 py-4 font-bold text-white disabled:opacity-50"
        >

          {saving

            ? "Saving..."

            : saved

              ? "✓ Saved"

              : "Save Profile"}

        </button>


      </div>


      {/* REPUTATION */}

      <div className="rounded-3xl bg-white p-6 shadow">


        <div className="flex items-center justify-between">


          <div>

            <p className="text-xs font-bold uppercase tracking-widest text-green-700">

              Reputation

            </p>

            <h2 className="mt-1 text-xl font-black">

              Gardener Reputation

            </h2>

          </div>


          <div className="text-4xl">

            🌟

          </div>


        </div>


        {profile.ratings_count === 0 ? (

          <div className="mt-5 rounded-2xl bg-green-50 p-5">


            <p className="font-bold">

              New gardener

            </p>


            <p className="mt-1 text-sm text-gray-600">

              Your reputation will grow after verified Local Market trades.

            </p>


          </div>

        ) : (

          <div className="mt-5">


            <p className="text-4xl font-black">

              {
                profile
                  .reputation_score
                  .toFixed(1)
              }

              <span className="text-lg text-gray-400">
                /5
              </span>

            </p>


            <p className="mt-1 text-sm text-gray-500">

              Based on{" "}

              {
                profile.ratings_count
              }

              {" "}ratings

            </p>


          </div>

        )}


        <div className="mt-5 border-t pt-4">


          <p className="text-sm text-gray-600">

            Later this area will show badges such as:

          </p>


          <div className="mt-3 flex flex-wrap gap-2">


            <span className="rounded-full bg-gray-100 px-3 py-2 text-xs font-semibold">

              🌱 New Grower

            </span>


            <span className="rounded-full bg-gray-100 px-3 py-2 text-xs font-semibold opacity-40">

              🤝 Trusted Trader

            </span>


            <span className="rounded-full bg-gray-100 px-3 py-2 text-xs font-semibold opacity-40">

              ⭐ 5-Star Gardener

            </span>


          </div>


        </div>


      </div>


    </section>

  );

}


function StatBox({
  emoji,
  label,
  value,
}: {
  emoji: string;
  label: string;
  value: number;
}) {

  return (

    <div className="rounded-2xl bg-white p-5 shadow">


      <div className="text-3xl">

        {emoji}

      </div>


      <p className="mt-2 text-2xl font-black">

        {value}

      </p>


      <p className="text-xs text-gray-500">

        {label}

      </p>


    </div>

  );

}