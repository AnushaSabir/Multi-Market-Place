import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function SyncPage() {
    const marketplaces = [
        { name: "Otto", status: "synced", lastSync: "5 mins ago" },
        { name: "eBay", status: "synced", lastSync: "12 mins ago" },
        { name: "Kaufland", status: "pending", lastSync: "1 hour ago" },
    ]

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Sync Status</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {marketplaces.map((mk) => (
                    <Card key={mk.name}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {mk.name}
                            </CardTitle>
                            <Badge variant={mk.status === 'synced' ? 'default' : 'destructive'}>
                                {mk.status}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Autosync On</div>
                            <p className="text-xs text-muted-foreground">
                                Last synced: {mk.lastSync}
                            </p>
                            <Button className="mt-4 w-full" variant="outline">Force Sync</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
