import EventsSection from "../../../components/EventsSection";

import { useAuth } from "../../../context/AuthContext";
import { useAppData } from "../../context/AppDataContext";

function EventsPage() {
  const {
    profile,
    isAdmin,
  } = useAuth();

  const {
    events = [],

    loading = {},
    errors = {},

    openCreateEvent,
    openEditEvent,
    deleteEvent,
    changeEventAttendance,
  } = useAppData();

  return (
    <EventsSection
      events={events}
      loading={loading.events ?? false}
      saving={loading.eventsSaving ?? false}
      error={errors.events ?? null}
      currentProfile={profile}
      isAdmin={isAdmin}
      onCreate={openCreateEvent}
      onEdit={openEditEvent}
      onDelete={deleteEvent}
      onAttendance={changeEventAttendance}
    />
  );
}

export default EventsPage;