import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Events } from "~/repositories/events";
import { ListEvents } from "./components/list-events-table";
import { ScrollArea } from "~/components/ui/scroll-area";

export default async function EventsPage() {
  const events = await Events.all();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eventos</CardTitle>
        <CardDescription>Todos os eventos que ocorrem na sua loja, podem ser conferidos nesta página.</CardDescription>
      </CardHeader>

      <CardContent className="px-0">
        <ScrollArea className="h-[calc(100dvh-218px)]">
          <ListEvents events={events} />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
