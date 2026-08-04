import {
  supabase,
} from "../lib/supabase";

export async function importGpxRide({
  profileId,
  activity,
  title,
  description,
}) {
  if (!profileId) {
    throw new Error(
      "Profil connecté introuvable.",
    );
  }

  if (!activity?.gpxHash) {
    throw new Error(
      "Analyse GPX introuvable.",
    );
  }

  const {
    data:
      existingRide,
    error:
      duplicateError,
  } = await supabase
    .from(
      "bike_rides",
    )
    .select("id, title")
    .eq(
      "gpx_hash",
      activity.gpxHash,
    )
    .maybeSingle();

  if (duplicateError) {
    throw duplicateError;
  }

  if (existingRide) {
    throw new Error(
      `Ce fichier a déjà été importé dans « ${existingRide.title} ».`,
    );
  }

  const {
    data:
      ride,
    error:
      insertError,
  } = await supabase
    .from(
      "bike_rides",
    )
    .insert({
      created_by:
        profileId,

      title:
        title?.trim() ||
        activity.title ||
        "Sortie vélo",

      description:
        description?.trim() ||
        activity.description ||
        null,

      ride_date:
        activity.rideDate,

      distance_km:
        activity.distanceKm,

      elevation_m:
        activity.elevationGainM,

      duration_minutes:
        activity.durationMinutes,

      average_speed:
        activity.averageSpeedKmh,

      route_data:
        activity.routeData,

      status:
        "completed",

      source:
        "gpx",

      gpx_hash:
        activity.gpxHash,

      gpx_file_name:
        activity.fileName,

      gpx_point_count:
        activity.pointCount,

      moving_time_seconds:
        activity.durationSeconds,

      started_at:
        activity.startTime
          ?.toISOString() ??
        activity.rideDate,

      ended_at:
        activity.endTime
          ?.toISOString() ??
        null,

      start_latitude:
        activity.startPoint
          ?.latitude ??
        null,

      start_longitude:
        activity.startPoint
          ?.longitude ??
        null,

      end_latitude:
        activity.endPoint
          ?.latitude ??
        null,

      end_longitude:
        activity.endPoint
          ?.longitude ??
        null,

      bounding_box:
        activity.boundingBox,
    })
    .select("id")
    .single();

  if (insertError) {
    if (
      insertError.code ===
      "23505"
    ) {
      throw new Error(
        "Ce fichier GPX a déjà été importé.",
      );
    }

    throw insertError;
  }

  const {
    error:
      participantError,
  } = await supabase
    .from(
      "bike_ride_participants",
    )
    .upsert(
      {
        ride_id:
          ride.id,

        profile_id:
          profileId,
      },
      {
        onConflict:
          "ride_id,profile_id",
      },
    );

  if (participantError) {
    throw participantError;
  }

  return ride;
}
