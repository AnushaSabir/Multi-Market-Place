"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Sparkles, RefreshCw, Store, ImageIcon, Save, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/products" prefetch={true}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Gaming Mouse Pro X</h1>
            <Badge variant="outline">SKU: GAM-001</Badge>
          </div>
          <p className="text-muted-foreground">EAN: 4260000000001 • Last sync: 12 minutes ago</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" /> Save
          </Button>
          <Button>
            <RefreshCw className="mr-2 h-4 w-4" /> Sync Now
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger
            value="basic"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-6"
          >
            Basic Info
          </TabsTrigger>
          <TabsTrigger
            value="ai"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-6"
          >
            AI Optimization
          </TabsTrigger>
          <TabsTrigger
            value="sync"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-6"
          >
            Marketplace Sync
          </TabsTrigger>
          <TabsTrigger
            value="images"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-6"
          >
            Images
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Product Title</Label>
                <Input defaultValue="Gaming Mouse Pro X" />
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input defaultValue="GAM-001" />
              </div>
              <div className="space-y-2">
                <Label>EAN</Label>
                <Input defaultValue="4260000000001" />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input defaultValue="0.150" type="number" />
              </div>
              <div className="space-y-2">
                <Label>Shipping Type</Label>
                <Input defaultValue="Package" />
              </div>
              <div className="space-y-2">
                <Label>Price (€)</Label>
                <Input defaultValue="59.99" type="number" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Original Content</CardTitle>
                <CardDescription>Raw data from import</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                  High quality gaming mouse with 16000 DPI sensor. RGB lighting and 6 programmable buttons. Lightweight
                  design for professional players. Compatible with Windows and Mac.
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/50 ring-1 ring-primary/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    AI Optimized (German)
                    <Sparkles className="h-4 w-4 text-blue-600" />
                  </CardTitle>
                  <CardDescription>SEO-optimized description</CardDescription>
                </div>
                <Button size="sm">Regenerate</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  className="min-h-[200px]"
                  defaultValue="Erleben Sie Präzision auf höchstem Niveau mit der Gaming Maus Pro X. Mit einem hochauflösenden 16.000 DPI Sensor bietet diese Maus die nötige Geschwindigkeit für kompetitive Gamer. Die anpassbare RGB-Beleuchtung und 6 programmierbare Tasten machen sie zum perfekten Werkzeug für jedes Setup."
                />
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-100 text-green-700">Ready for Sync</Badge>
                  <span className="text-xs text-muted-foreground">Score: 98/100</span>
                </div>
              </CardContent>
            </Card>
          </div>
          <Button className="w-full md:w-auto">
            <Sparkles className="mr-2 h-4 w-4" />
            Start Optimization Now
          </Button>
        </TabsContent>

        <TabsContent value="sync" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {["Otto", "eBay", "Kaufland", "Shopify"].map((shop) => (
              <Card key={shop}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Store className="h-5 w-5" />
                      {shop}
                    </CardTitle>
                    <Badge variant={shop === "eBay" ? "destructive" : "secondary"}>
                      {shop === "eBay" ? "Sync Error" : "Synced"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Last sync:</span>
                      <span>Today, 2:22 PM</span>
                    </div>
                    {shop === "eBay" && (
                      <div className="text-red-600 bg-red-50 p-2 rounded mt-2 flex gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>Price update failed (API timeout)</span>
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <RefreshCw className="mr-2 h-3 w-3" /> Re-Sync
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="images" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sirv Image Hosting</CardTitle>
              <CardDescription>Images are managed directly via Sirv URL</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="group relative aspect-square bg-muted rounded-lg overflow-hidden border">
                    <img
                      src={`/gaming-mouse-.jpg?key=upo91&height=400&width=400&query=gaming+mouse+${i}`}
                      alt={`Product ${i}`}
                      className="object-contain w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="secondary" className="h-8 w-8">
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4 rotate-45" />
                      </Button>
                    </div>
                  </div>
                ))}
                <button className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs font-medium">Add Image</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
