import { useState, useEffect } from 'react';
import eventService, { Event } from '../services/eventService';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEvents();
      setEvents(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (data: Partial<Event>) => {
    try {
      const newEvent = await eventService.createEvent(data);
      setEvents([...events, newEvent]);
      return newEvent;
    } catch (err) {
      setError('Failed to create event');
      console.error(err);
      throw err;
    }
  };

  const updateEvent = async (id: number, data: Partial<Event>) => {
    try {
      const updatedEvent = await eventService.updateEvent(id, data);
      setEvents(events.map(event => 
        event.id === id ? updatedEvent : event
      ));
      return updatedEvent;
    } catch (err) {
      setError('Failed to update event');
      console.error(err);
      throw err;
    }
  };

  const deleteEvent = async (id: number) => {
    try {
      await eventService.deleteEvent(id);
      setEvents(events.filter(event => event.id !== id));
    } catch (err) {
      setError('Failed to delete event');
      console.error(err);
      throw err;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent
  };
};

export const useEvent = (id: number) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEvent(id);
      setEvent(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch event');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  return {
    event,
    loading,
    error,
    fetchEvent
  };
};