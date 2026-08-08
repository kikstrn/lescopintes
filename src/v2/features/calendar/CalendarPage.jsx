import {
  useMemo,
} from "react";

import CalendarSection from "../../../components/calendar/CalendarSection";

import {
  useAppData,
} from "../../context/AppDataContext";

import {
  buildCalendarItems,
} from "./calendarUtils";

function CalendarPage() {
  const {
    events = [],
    bikeRides = [],
    tennisMatches = [],
    members = [],

    loading = {},
    errors = {},

    openCreateEvent,
    openCreateBikeRide,
    openScoreModal,
  } = useAppData();

  const items = useMemo(
    () =>
      buildCalendarItems({
        events,
        bikeRides,
        tennisMatches,
        members,
      }),
    [
      events,
      bikeRides,
      tennisMatches,
      members,
    ],
  );

  const calendarLoading =
    loading.events ||
    loading.bike ||
    loading.tennis ||
    loading.profiles;

  const calendarError =
    errors.events ??
    errors.bike ??
    errors.tennis ??
    errors.profiles ??
    null;

  return (
    <CalendarSection
      items={items}
      loading={Boolean(calendarLoading)}
      error={calendarError}
      onCreateEvent={openCreateEvent}
      onCreateBikeRide={openCreateBikeRide}
      onCreateTennisMatch={openScoreModal}
    />
  );
}

export default CalendarPage;
