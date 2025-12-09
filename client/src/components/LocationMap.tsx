import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapView } from "./Map";

interface Coordinates {
  lat: number;
  lng: number;
  name: string;
}

interface LocationMapProps {
  coordinates: Coordinates;
  title: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function LocationMap({
  coordinates,
  title,
  isOpen = false,
  onToggle,
}: LocationMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMapReady = (map: google.maps.Map) => {
    try {
      mapRef.current = map;
      setError(null);

      // 添加標記
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: coordinates.lat, lng: coordinates.lng },
        map: map,
        title: coordinates.name,
      });

      // 創建自訂標籤
      const label = document.createElement("div");
      label.innerHTML = `
        <div style="
          background-color: #D4A574;
          color: white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          📍
        </div>
      `;
      marker.content = label;

      // 信息窗口
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; font-family: 'Lato', sans-serif;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #333;">
              ${coordinates.name}
            </h3>
            <p style="margin: 0; font-size: 12px; color: #666;">
              📍 ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}
            </p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });

      infoWindow.open(map, marker);
      setIsLoading(false);
    } catch (err) {
      console.error("Map initialization error:", err);
      setError("地圖初始化失敗");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="w-full justify-between mb-3 border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-xs md:text-sm overflow-hidden"
      >
        <span className="flex items-center gap-2 shrink-0">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          <span className="font-medium hidden sm:inline">
            {isOpen ? "隱藏地圖" : "查看地圖"}
          </span>
          <span className="font-medium sm:hidden">
            {isOpen ? "隱" : "看"}
          </span>
        </span>
        <span className="text-xs text-muted-foreground truncate shrink-0 max-w-[120px] md:max-w-none">
          {coordinates.name}
        </span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-muted/30 rounded-lg p-3 md:p-4 border border-border/50">
              {error ? (
                <div className="flex items-center gap-3 text-xs md:text-sm text-destructive bg-destructive/10 p-3 rounded">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : (
                <>
                  {isLoading && (
                    <div className="flex items-center justify-center h-48 md:h-64 text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      <span className="text-sm">地圖載入中...</span>
                    </div>
                  )}
                  <div className={isLoading ? "hidden" : "block"}>
                    <MapView
                      initialCenter={{ lat: coordinates.lat, lng: coordinates.lng }}
                      initialZoom={16}
                      onMapReady={handleMapReady}
                      className="w-full h-64 rounded-lg overflow-hidden shadow-md"
                    />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
