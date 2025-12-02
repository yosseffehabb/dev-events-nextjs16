import EventsCard from "@/components/EventsCard";
import ExploreBtn from "@/components/ExploreBtn";
import { IEvent } from "@/database";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

async function page() {
  const response = await fetch(`${BASE_URL}/api/events`);
  const { events } = await response.json();

  console.log(events);

  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br /> Events You Cant Miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetups, and Confernces, All in One Place{" "}
      </p>
      <ExploreBtn />
      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>
        <ul className="events">
          {events.map((event: IEvent) => (
            <EventsCard key={event.title} {...event} />
          ))}
        </ul>
      </div>
    </section>
  );
}

export default page;
