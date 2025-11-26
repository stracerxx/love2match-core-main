import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, Users, Heart } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  attendees: number;
  image?: string;
  isLiked?: boolean;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Speed Dating Night',
      description: 'Meet new people in a fun, fast-paced environment. 3-minute rounds with drinks and appetizers.',
      date: 'Nov 25, 2025',
      time: '7:00 PM',
      location: 'Downtown Lounge, City Center',
      category: 'Social',
      attendees: 24,
      isLiked: false,
    },
    {
      id: '2',
      title: 'Outdoor Picnic & Games',
      description: 'Join us for a relaxed afternoon of lawn games, picnics, and great conversations.',
      date: 'Nov 26, 2025',
      time: '2:00 PM',
      location: 'Central Park, Recreation Area',
      category: 'Outdoor',
      attendees: 18,
      isLiked: false,
    },
    {
      id: '3',
      title: 'Wine Tasting & Networking',
      description: 'Explore local wines with fellow singles. Hosted by a certified sommelier.',
      date: 'Nov 27, 2025',
      time: '6:00 PM',
      location: 'Vineyard Hall, Downtown',
      category: 'Wine & Dine',
      attendees: 32,
      isLiked: false,
    },
    {
      id: '4',
      title: 'Salsa Dance Class & Social',
      description: 'Learn salsa basics from a professional instructor, then dance the night away!',
      date: 'Nov 28, 2025',
      time: '8:00 PM',
      location: 'Dance Studio Loft, Arts District',
      category: 'Dancing',
      attendees: 28,
      isLiked: false,
    },
    {
      id: '5',
      title: 'Trivia Night Challenge',
      description: 'Team up with other singles for a night of fun trivia, prizes, and networking.',
      date: 'Nov 29, 2025',
      time: '7:30 PM',
      location: 'The Brew Pub, Main Street',
      category: 'Games',
      attendees: 40,
      isLiked: false,
    },
  ]);

  const [likedEventIds, setLikedEventIds] = useState<Set<string>>(new Set());
  const [rsvpEventIds, setRsvpEventIds] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Social');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  const categories = ['Social', 'Outdoor', 'Wine & Dine', 'Dancing', 'Games'];

  const filteredEvents = selectedCategory
    ? events.filter((e) => e.category === selectedCategory)
    : events;

  const handleLike = (id: string) => {
    const newLiked = new Set(likedEventIds);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedEventIds(newLiked);
  };

  const handleCreate = async () => {
    if (!title || !date || !time || !location) {
      toast({ title: 'Missing fields', description: 'Please fill title, date, time and location.' });
      return;
    }

    const newEvent: Event = {
      id: `local-${Date.now()}`,
      title,
      description,
      date,
      time,
      location,
      category,
      attendees: 1,
      isLiked: false,
    };

    setIsSubmitting(true);
    setEvents((s) => [newEvent, ...s]);
    toast({ title: 'Event created', description: 'Your event was created successfully.' });

    setIsSubmitting(false);
    setOpen(false);
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setLocation('');
    setCategory('Social');
  };

  const handleRsvp = (id: string) => {
    if (!user) {
      toast({ title: 'Login required', description: 'Please sign in to RSVP for events.' });
      return;
    }

    const newRsvp = new Set(rsvpEventIds);
    if (newRsvp.has(id)) {
      newRsvp.delete(id);
    } else {
      newRsvp.add(id);
    }
    setRsvpEventIds(newRsvp);
  };

  return (
    <div className="min-h-screen p-6 md:ml-20 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Upcoming Events</h1>
            <p className="text-muted-foreground">Meet new people at exciting events happening near you</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Create Event</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Event title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Event description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="Nov 25, 2025"
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="7:00 PM"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Downtown Lounge"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
            size="sm"
          >
            All Events
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat)}
              size="sm"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <Link key={event.id} to={`/events/${event.id}`} className="no-underline">
              <Card className="shadow-card overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5">
                    {/* Event Image Placeholder */}
                    <div className="md:col-span-1">
                      <div className="bg-gradient-to-br from-magenta-500/20 to-cyan-500/20 rounded-lg aspect-square flex items-center justify-center border border-magenta-500/30">
                        <Calendar className="h-8 w-8 text-magenta-400" />
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="md:col-span-2 space-y-3">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold">{event.title}</h3>
                          <Badge variant="outline" className="ml-2">{event.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{event.date} at {event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{event.attendees} people interested</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="md:col-span-1 flex flex-col gap-2 justify-between">
                      <Button
                        variant={likedEventIds.has(event.id) ? 'default' : 'outline'}
                        onClick={(e) => {
                          e.preventDefault();
                          handleLike(event.id);
                        }}
                        className="w-full gap-2"
                      >
                        <Heart
                          className={`h-4 w-4 ${likedEventIds.has(event.id) ? 'fill-current' : ''}`}
                        />
                        Like
                      </Button>
                      <Button
                        variant={rsvpEventIds.has(event.id) ? 'default' : 'outline'}
                        onClick={(e) => {
                          e.preventDefault();
                          handleRsvp(event.id);
                        }}
                        className="w-full"
                      >
                        {rsvpEventIds.has(event.id) ? '✓ RSVP\'d' : 'RSVP'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* No Events Message */}
        {filteredEvents.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No events found for this category.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Events;
