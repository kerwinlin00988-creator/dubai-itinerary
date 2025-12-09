import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Clock, 
  Ticket, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Sun, 
  Moon, 
  Calendar,
  DollarSign,
  ExternalLink,
  Car,
  Utensils,
  ShoppingBag,
  Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import LocationMap from "@/components/LocationMap";
import DailyRouteMap from "@/components/DailyRouteMap";
import PlacesReviews from "@/components/PlacesReviews";
import itineraryData from "../data.json";

// Types
interface Coordinates {
  lat: number;
  lng: number;
  name: string;
}

interface ItineraryItem {
  time: string;
  activity: string;
  english_name: string;
  duration: string;
  price: string;
  purchase: string;
  note: string;
  coordinates?: Coordinates;
}

interface DayItinerary {
  day: string;
  items: ItineraryItem[];
}

interface TicketInfo {
  景點名稱: string;
  英文名稱: string;
  "官網價格(AED)": string;
  "Klook價格(AED)": string;
  "GetYourGuide價格(AED)": string;
  "現場價格(AED)": string;
  推薦購買管道: string;
  備註: string;
}

interface Data {
  itinerary: DayItinerary[];
  tickets: TicketInfo[];
}

const data = itineraryData as Data;

// Helper to get icon based on activity
const getActivityIcon = (activity: string) => {
  if (activity.includes("餐") || activity.includes("下午茶")) return <Utensils className="w-5 h-5" />;
  if (activity.includes("購物") || activity.includes("市集")) return <ShoppingBag className="w-5 h-5" />;
  if (activity.includes("車") || activity.includes("前往")) return <Car className="w-5 h-5" />;
  if (activity.includes("飯店") || activity.includes("入住")) return <MapPin className="w-5 h-5" />;
  if (activity.includes("拍照") || activity.includes("觀賞")) return <Camera className="w-5 h-5" />;
  return <MapPin className="w-5 h-5" />;
};

// Helper to get background image for the day
const getDayBackground = (day: string) => {
  if (day.includes("杜拜")) return "/images/hero-dubai.jpg";
  if (day.includes("阿布達比")) return "/images/hero-abudhabi.jpg";
  if (day.includes("阿爾愛因")) return "/images/hero-alain.jpg";
  return "/images/hero-desert.jpg";
};

export default function Home() {
  const [activeDay, setActiveDay] = useState(data.itinerary[0].day);
  const [selectedTicket, setSelectedTicket] = useState<TicketInfo | null>(null);
  const [expandedMaps, setExpandedMaps] = useState<Set<string>>(new Set());

  const toggleMap = (key: string) => {
    const newSet = new Set(expandedMaps);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setExpandedMaps(newSet);
  };

  // Scroll to top on day change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeDay]);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground overflow-x-hidden w-screen">
      {/* Hero Section */}
      <header className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
            src="/images/hero-dubai.jpg" 
            alt="Dubai Skyline" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-4 bg-primary/90 text-primary-foreground hover:bg-primary px-4 py-1 text-sm uppercase tracking-widest">
              2026 Family Trip
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-6 drop-shadow-lg">
              Dubai & Beyond
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed">
              探索杜拜的奢華、阿布達比的宏偉與阿爾愛因的綠洲寧靜。
              <br/>專為家庭設計的10天夢幻旅程。
            </p>
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </header>

      <main className="w-full px-4 py-12 -mt-20 relative z-20">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Sidebar Navigation (Desktop) */}
          <div className="hidden lg:block lg:col-span-3 space-y-4 sticky top-8 h-fit">
            <Card className="border-none shadow-lg bg-card/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-xl font-heading text-primary">行程總覽</CardTitle>
                <CardDescription>10天精彩旅程</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="flex flex-col p-2">
                    {data.itinerary.map((day, index) => (
                      <Button
                        key={index}
                        variant={activeDay === day.day ? "default" : "ghost"}
                        className={`justify-start text-left mb-1 h-auto py-3 px-4 transition-all duration-300 ${
                          activeDay === day.day 
                            ? "bg-primary text-primary-foreground shadow-md translate-x-1" 
                            : "hover:bg-muted hover:translate-x-1"
                        }`}
                        onClick={() => setActiveDay(day.day)}
                      >
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-bold text-sm">{day.day.split(' ')[0]}</span>
                          <span className="text-xs opacity-80 truncate w-full">
                            {day.items.find(i => i.time !== "06:15" && i.time !== "05:00")?.activity || "行程開始"}
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-secondary/10 overflow-hidden">
              <CardContent className="p-6">
                <h3 className="font-heading font-bold text-lg mb-2 text-secondary-foreground">門票省錢攻略</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  我們整理了各大景點的門票價格比較，幫助您節省預算。
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                      查看價格比較表
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="font-heading text-2xl">景點門票價格比較</DialogTitle>
                      <DialogDescription>
                        比較官網、Klook與現場購票價格 (單位: AED)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>景點名稱</TableHead>
                            <TableHead>官網價格</TableHead>
                            <TableHead className="text-green-600 font-bold">Klook價格</TableHead>
                            <TableHead>推薦管道</TableHead>
                            <TableHead>備註</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.tickets.map((ticket, idx) => (
                            <TableRow key={idx} className="hover:bg-muted/50">
                              <TableCell className="font-medium">
                                {ticket.景點名稱}
                                <div className="text-xs text-muted-foreground">{ticket.英文名稱}</div>
                              </TableCell>
                              <TableCell>{ticket["官網價格(AED)"]}</TableCell>
                              <TableCell className="text-green-600 font-bold">{ticket["Klook價格(AED)"]}</TableCell>
                              <TableCell>
                                <Badge variant={ticket.推薦購買管道.includes("Klook") ? "default" : "outline"}>
                                  {ticket.推薦購買管道}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                                {ticket.備註}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Navigation (Tabs) */}
          <div className="lg:hidden w-full sticky top-4 z-30 mb-4 bg-background/95 backdrop-blur-sm border-b border-border overflow-x-auto">
            <div className="flex p-2 gap-2 w-fit min-w-full">
              {data.itinerary.map((day, index) => (
                <Button
                  key={index}
                  variant={activeDay === day.day ? "default" : "ghost"}
                  size="sm"
                  className="text-xs shrink-0 pointer-events-auto"
                  onClick={() => setActiveDay(day.day)}
                >
                  {day.day.split(' ')[0]}
                </Button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-1 lg:col-span-9 w-full overflow-x-hidden">
            <AnimatePresence mode="wait">
              {data.itinerary.map((day) => (
                activeDay === day.day && (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-8 w-full overflow-x-hidden"
                  >
                    {/* Day Header */}
                    <div className="relative rounded-3xl overflow-hidden shadow-xl h-48 md:h-64 group">
                      <img 
                        src={getDayBackground(day.day)} 
                        alt={day.day}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center px-8 md:px-12">
                        <div>
                          <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-2">
                            {day.day.split(' ')[0]}
                          </h2>
                          <p className="text-white/80 text-lg md:text-xl font-light">
                            {day.day.split(' ').slice(1).join(' ')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Daily Route Map */}
                    <DailyRouteMap
                      dayName={day.day}
                      locations={day.items
                        .filter(item => item.coordinates && item.english_name !== "-")
                        .map(item => item.coordinates!)}
                    />

                    {/* Timeline */}
                    <div className="relative py-8 w-full">
                      {/* Center Line (Desktop) */}
                      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent hidden md:block" />
                      {/* Left Line (Mobile) */}
                      <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent md:hidden" />

                      <div className="space-y-12 w-full">
                        {day.items.map((item, idx) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            className={`relative flex flex-col md:flex-row gap-6 md:gap-8 w-full ${
                              idx % 2 === 0 ? "md:flex-row-reverse" : ""
                            }`}
                          >
                            {/* Timeline Dot */}
                            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 top-0 z-10">
                              <div className="bg-background p-1.5 rounded-full border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                                <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-full text-white shadow-inner">
                                  {getActivityIcon(item.activity)}
                                </div>
                              </div>
                            </div>

                            {/* Content Side */}
                            <div className="flex-1 ml-12 md:ml-0 pt-2 w-full md:w-auto">
                              <Card className={`
                                group relative overflow-hidden border-none bg-white/80 dark:bg-black/40 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-500 w-full
                                ${idx % 2 === 0 ? "md:text-left" : "md:text-right"}
                              `}>
                                {/* Decorative Gradient Border */}
                                <div className="absolute inset-0 p-[1px] rounded-xl bg-gradient-to-br from-primary/30 via-transparent to-primary/10 pointer-events-none" />
                                
                                {/* Hover Glow Effect */}
                                <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />

                                <CardContent className="p-4 md:p-6 relative z-10">
                                  {/* Header Info */}
                                  <div className={`flex flex-col gap-2 mb-4 ${
                                    idx % 2 === 0 ? "md:items-start" : "md:items-end"
                                  }`}>
                                    <div className="flex items-center gap-2 text-primary font-bold bg-primary/5 px-3 py-1 rounded-full w-fit text-sm md:text-base">
                                      <Clock className="w-4 h-4" />
                                      <span>{item.time}</span>
                                      {item.duration !== "-" && (
                                        <>
                                          <span className="w-1 h-1 rounded-full bg-primary/40" />
                                          <span className="text-xs font-normal opacity-80">{item.duration}</span>
                                        </>
                                      )}
                                    </div>
                                    
                                    <h3 className="text-lg md:text-2xl font-heading font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                                      {item.activity}
                                    </h3>
                                    
                                    {item.english_name !== "-" && (
                                      <p className="text-xs md:text-sm text-muted-foreground font-medium font-accent tracking-wide uppercase">
                                        {item.english_name}
                                      </p>
                                    )}
                                  </div>

                                  {/* Price & Details */}
                                  <div className={`flex flex-col gap-4 ${
                                    idx % 2 === 0 ? "md:items-start" : "md:items-end"
                                  }`}>
                                    {item.price !== "-" && (
                                      <div className={`flex items-center gap-3 text-sm md:text-base ${
                                        idx % 2 === 0 ? "flex-row" : "md:flex-row-reverse"
                                      }`}>
                                        <Badge variant="outline" className={`
                                          border-primary/20 text-primary bg-primary/5 px-3 py-1 text-xs md:text-sm
                                          ${item.price === "免費" ? "bg-green-500/10 text-green-600 border-green-200" : ""}
                                        `}>
                                          {item.price === "免費" ? "免費入場" : "需購票"}
                                        </Badge>
                                        {item.price !== "免費" && (
                                          <span className="text-xs md:text-sm font-bold text-foreground/80">
                                            {item.price}
                                          </span>
                                        )}
                                      </div>
                                    )}

                                    {/* Info Box */}
                                    {(item.note !== "-" || item.purchase !== "-") && (
                                      <div className={`
                                        mt-2 p-3 md:p-4 rounded-lg bg-muted/50 border border-border/50 w-full text-left text-xs md:text-sm
                                        ${idx % 2 === 0 ? "rounded-tl-none" : "md:rounded-tr-none"}
                                      `}>
                                        {item.note !== "-" && (
                                          <div className="flex items-start gap-2.5 text-xs md:text-sm mb-2 last:mb-0">
                                            <Info className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                                            <span className="text-foreground/80 leading-relaxed">{item.note}</span>
                                          </div>
                                        )}
                                        
                                        {item.purchase !== "-" && (
                                          <div className="flex items-center gap-2.5 text-xs md:text-sm pt-2 border-t border-border/50 mt-2">
                                            <DollarSign className="w-4 h-4 text-green-600 shrink-0" />
                                            <span className="font-medium text-foreground/70">購買管道:</span>
                                            <span className="text-green-700 font-bold bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded text-xs">
                                              {item.purchase}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Location Map */}
                                    {item.coordinates && item.english_name !== "-" && (
                                      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border/50 w-full">
                                        <LocationMap
                                          coordinates={item.coordinates}
                                          title={item.activity}
                                          isOpen={expandedMaps.has(`${day.day}-${idx}`)}
                                          onToggle={() => toggleMap(`${day.day}-${idx}`)}
                                        />
                                      </div>
                                    )}

                                    {/* Google Places Reviews */}
                                    {item.coordinates && item.english_name !== "-" && (
                                      <PlacesReviews
                                        placeName={item.activity}
                                        coordinates={item.coordinates}
                                      />
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                            
                            {/* Empty Space for Zigzag Balance */}
                            <div className="flex-1 hidden md:block" />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 py-12 mt-12 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-heading font-bold text-primary mb-4">Ready for Dubai?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            這個行程專為您的家庭量身打造，結合了杜拜的現代奇蹟與阿爾愛因的自然之美。
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Button variant="outline" onClick={() => window.print()}>
              列印行程
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>查看門票攻略</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl">景點門票價格比較</DialogTitle>
                  <DialogDescription>
                    比較官網、Klook與現場購票價格 (單位: AED)
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>景點名稱</TableHead>
                        <TableHead>官網價格</TableHead>
                        <TableHead className="text-green-600 font-bold">Klook價格</TableHead>
                        <TableHead>推薦管道</TableHead>
                        <TableHead>備註</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.tickets.map((ticket, idx) => (
                        <TableRow key={idx} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {ticket.景點名稱}
                            <div className="text-xs text-muted-foreground">{ticket.英文名稱}</div>
                          </TableCell>
                          <TableCell>{ticket["官網價格(AED)"]}</TableCell>
                          <TableCell className="text-green-600 font-bold">{ticket["Klook價格(AED)"]}</TableCell>
                          <TableCell>
                            <Badge variant={ticket.推薦購買管道.includes("Klook") ? "default" : "outline"}>
                              {ticket.推薦購買管道}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                            {ticket.備註}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-xs text-muted-foreground mt-12 opacity-50">
            Designed with ❤️ for your family trip
          </p>
        </div>
      </footer>
    </div>
  );
}
