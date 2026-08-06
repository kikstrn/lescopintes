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
        }),
      [
        events,
        bikeRides,
        tennisMatches,
      ],
    );
  
    const calendarLoading =
      loading.events ||
      loading.bike ||
      loading.tennis;
  
    const calendarError =
      errors.events ??
      errors.bike ??
      errors.tennis ??
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
  