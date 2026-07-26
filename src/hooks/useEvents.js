import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { supabase } from "../lib/supabase";
import {
  createEvent,
  deleteEvent,
  getEvents,
  setAttendance,
  updateEvent,
} from "../services/eventService";

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const refreshTimeoutRef = useRef(null);

  const loadEvents = useCallback(async ({
    showLoading = true,
  } = {}) => {
    if (showLoading) {
      setLoading(true);
    }

    setError(null);

    try {
      const eventList = await getEvents();
      setEvents(eventList);
    } catch (requestError) {
      console.error(
        "Impossible de charger les événements :",
        requestError,
      );

      setError(
        requestError?.message ??
          "Impossible de charger les événements.",
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      window.clearTimeout(refreshTimeoutRef.current);
    }

    refreshTimeoutRef.current = window.setTimeout(() => {
      loadEvents({
        showLoading: false,
      });
    }, 150);
  }, [loadEvents]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    const channel = supabase
      .channel("copintes-events-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
        },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_participants",
        },
        scheduleRefresh,
      )
      .subscribe();

    return () => {
      if (refreshTimeoutRef.current) {
        window.clearTimeout(refreshTimeoutRef.current);
      }

      supabase.removeChannel(channel);
    };
  }, [scheduleRefresh]);

  const addEvent = useCallback(
    async (eventData) => {
      setSaving(true);
      setError(null);

      try {
        const createdEvent = await createEvent(eventData);

        await loadEvents({
          showLoading: false,
        });

        return createdEvent;
      } catch (requestError) {
        console.error(
          "Impossible de créer l’événement :",
          requestError,
        );

        setError(
          requestError?.message ??
            "Impossible de créer l’événement.",
        );

        throw requestError;
      } finally {
        setSaving(false);
      }
    },
    [loadEvents],
  );

  const editEvent = useCallback(
    async (eventId, eventData) => {
      setSaving(true);
      setError(null);

      try {
        const updatedEvent = await updateEvent(
          eventId,
          eventData,
        );

        await loadEvents({
          showLoading: false,
        });

        return updatedEvent;
      } catch (requestError) {
        console.error(
          "Impossible de modifier l’événement :",
          requestError,
        );

        setError(
          requestError?.message ??
            "Impossible de modifier l’événement.",
        );

        throw requestError;
      } finally {
        setSaving(false);
      }
    },
    [loadEvents],
  );

  const removeEvent = useCallback(
    async (eventId) => {
      setSaving(true);
      setError(null);

      try {
        await deleteEvent(eventId);

        setEvents((currentEvents) =>
          currentEvents.filter(
            (event) => event.id !== eventId,
          ),
        );
      } catch (requestError) {
        console.error(
          "Impossible de supprimer l’événement :",
          requestError,
        );

        setError(
          requestError?.message ??
            "Impossible de supprimer l’événement.",
        );

        throw requestError;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const changeAttendance = useCallback(
    async ({
      eventId,
      profileId,
      attendanceStatus,
    }) => {
      setError(null);

      try {
        await setAttendance({
          eventId,
          profileId,
          attendanceStatus,
        });

        await loadEvents({
          showLoading: false,
        });
      } catch (requestError) {
        console.error(
          "Impossible de modifier la participation :",
          requestError,
        );

        setError(
          requestError?.message ??
            "Impossible de modifier la participation.",
        );

        throw requestError;
      }
    },
    [loadEvents],
  );

  return {
    events,
    loading,
    saving,
    error,
    refreshEvents: loadEvents,
    addEvent,
    editEvent,
    removeEvent,
    changeAttendance,
  };
}