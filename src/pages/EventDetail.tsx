import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, MapPin, Users } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  attendees: number;
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvped, setRsvped] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // For now, load from localStorage/state - events are client-side only
    // In a real app, this would query the DB
    setTimeout(() => {
      // Placeholder: no persistence yet
      setEvent(null);
      setLoading(false);
    }, 100);
  }, [id]);

  const handleRsvp = async () => {
    if (!user) {
      toast({ title: 'Login required', description: 'Please sign in to RSVP for events.' });
      return;
    }

    setRsvped((s) => !s);
    toast({ title: rsvped ? 'RSVP removed' : 'RSVP confirmed', description: rsvped ? 'You have removed your RSVP.' : "You're on the list!" });
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 md:ml-20 bg-background">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <p>Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen p-6 md:ml-20 bg-background">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-2">Event Details</h2>
              <p className="text-muted-foreground mb-4">Select an event from the list to view details.</p>
              <Link to="/events">
                <Button>Back to Events</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:ml-20 bg-background">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-card">
          <CardContent className="p-6">
            {/* Event Header */}
            <div className="mb-6">
              <div className="bg-gradient-to-br from-magenta-500/20 to-cyan-500/20 rounded-lg h-48 mb-4 flex items-center justify-center border border-magenta-500/30">
                <Calendar className="h-16 w-16 text-magenta-400 opacity-50" />
              </div>
              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{event.date} at {event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{event.attendees} people interested</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">About this event</h2>
              <p className="text-muted-foreground">{event.description}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleRsvp} size="lg" variant={rsvped ? 'default' : 'outline'}>
                {rsvped ? "✓ You're going" : 'RSVP Now'}
              </Button>
              <Link to="/events">
                <Button size="lg" variant="ghost">Back to Events</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventDetail;
