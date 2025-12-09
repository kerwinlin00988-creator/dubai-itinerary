import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Loader2, AlertCircle, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Review {
  author_name: string;
  rating: number;
  text: string;
  time: string;
  profile_photo_url?: string;
}

interface PlacesReviewsProps {
  placeName: string;
  coordinates: { lat: number; lng: number };
}

export default function PlacesReviews({ placeName, coordinates }: PlacesReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const google = (window as any).google;

        if (!google || !google.maps) {
          setError("Google Maps API 尚未加載");
          setIsLoading(false);
          return;
        }

        // 使用 Places Service 搜索地點
        const service = new google.maps.places.PlacesService(
          document.createElement("div")
        );

        const request = {
          location: new google.maps.LatLng(coordinates.lat, coordinates.lng),
          radius: 500,
          keyword: placeName,
        };

        service.nearbySearch(request, (results: any, status: any) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results[0]) {
            const placeId = results[0].place_id;

            // 獲取詳細信息和評論
            const detailsRequest = { placeId };
            service.getDetails(detailsRequest, (place: any, detailsStatus: any) => {
              if (detailsStatus === google.maps.places.PlacesServiceStatus.OK && place) {
                const placeReviews = place.reviews || [];
                setReviews(placeReviews.slice(0, 3)); // 只顯示前3條評論

                if (placeReviews.length > 0) {
                  const avgRating =
                    placeReviews.reduce((sum: number, r: Review) => sum + r.rating, 0) /
                    placeReviews.length;
                  setAverageRating(Math.round(avgRating * 10) / 10);
                }

                setIsLoading(false);
              } else {
                setError("無法獲取評論信息");
                setIsLoading(false);
              }
            });
          } else {
            setError("未找到該地點");
            setIsLoading(false);
          }
        });
      } catch (err) {
        console.error("Places API error:", err);
        setError("評論載入失敗");
        setIsLoading(false);
      }
    };

    // 延遲執行以確保 Google Maps API 已加載
    const timer = setTimeout(fetchReviews, 500);
    return () => clearTimeout(timer);
  }, [placeName, coordinates]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        <span className="text-xs md:text-sm">評論載入中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground py-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border/50"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-bold text-foreground">{averageRating}</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          遊客評論
        </Badge>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {reviews.map((review, idx) => (
          <Card key={idx} className="border-none bg-muted/30 shadow-none hover:bg-muted/50 transition-colors">
            <CardContent className="p-3">
              <div className="flex items-start gap-2.5">
                {review.profile_photo_url ? (
                  <img
                    src={review.profile_photo_url}
                    alt={review.author_name}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs md:text-sm font-bold text-foreground truncate">
                      {review.author_name}
                    </span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed">
                    {review.text}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{review.time}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
