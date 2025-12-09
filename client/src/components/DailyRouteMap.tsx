import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, MapPin } from "lucide-react";
import { MapView } from "./Map";

interface Coordinates {
  lat: number;
  lng: number;
  name: string;
}

interface DailyRouteMapProps {
  dayName: string;
  locations: Coordinates[];
}

export default function DailyRouteMap({ dayName, locations }: DailyRouteMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleMapReady = (map: google.maps.Map) => {
    try {
      mapRef.current = map;
      setError(null);

      if (locations.length === 0) {
        setIsLoading(false);
        return;
      }

      // 計算邊界以包含所有位置
      const bounds = new google.maps.LatLngBounds();
      locations.forEach((loc) => {
        bounds.extend({ lat: loc.lat, lng: loc.lng });
      });

      // 設置邊界
      map.fitBounds(bounds, 50);

      // 添加標記和折線
      const path: google.maps.LatLngLiteral[] = [];
      locations.forEach((location, index) => {
        path.push({ lat: location.lat, lng: location.lng });

        // 添加標記
        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: location.lat, lng: location.lng },
          map: map,
          title: location.name,
        });

        // 創建自訂標籤
        const label = document.createElement("div");
        label.textContent = String(index + 1);
        label.style.cssText = `
          background-color: ${index === 0 ? "#4CAF50" : index === locations.length - 1 ? "#FF6B6B" : "#D4A574"};
          color: white;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `;
        marker.content = label;

        // 信息窗口
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; font-family: 'Lato', sans-serif;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #333;">
                ${index + 1}. ${location.name}
              </h3>
              <p style="margin: 0; font-size: 12px; color: #666;">
                📍 ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}
              </p>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });
      });

      // 添加折線連接所有位置
      new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: "#D4A574",
        strokeOpacity: 0.7,
        strokeWeight: 3,
        map: map,
      });

      setIsLoading(false);
    } catch (err) {
      console.error("Route map initialization error:", err);
      setError("路線地圖初始化失敗");
      setIsLoading(false);
    }
  };

  // 計算中心點
  const center =
    locations.length > 0
      ? {
          lat: locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length,
          lng: locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length,
        }
      : { lat: 25.2048, lng: 55.2708 }; // Dubai default

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="w-full mb-8"
    >
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 md:p-6 border border-primary/20 shadow-lg overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary/20 p-2 rounded-lg">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg md:text-xl font-heading font-bold text-foreground">
            {dayName} - 每日路線規劃
          </h3>
        </div>

        {error ? (
          <div className="flex items-center gap-3 text-sm text-destructive bg-destructive/10 p-3 rounded">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="flex items-center justify-center h-96 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">路線地圖載入中...</span>
              </div>
            )}
            <div className={isLoading ? "hidden" : "block"}>
              <MapView
                initialCenter={center}
                initialZoom={14}
                onMapReady={handleMapReady}
                className="w-full h-96 rounded-xl overflow-hidden shadow-md"
              />
            </div>
          </>
        )}

        {/* 景點列表 */}
        {locations.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {locations.map((loc, idx) => (
              <div
                key={idx}
                className="text-xs md:text-sm p-2 rounded-lg bg-background/50 border border-border/50 hover:bg-primary/5 transition-colors"
              >
                <div className="font-bold text-primary mb-1">
                  {idx + 1}. {loc.name.substring(0, 12)}
                  {loc.name.length > 12 ? "..." : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
